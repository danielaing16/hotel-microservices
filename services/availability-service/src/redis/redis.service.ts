import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);

    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log(`🟢 Conexión exitosa a Redis (${host}:${port})`);
    });

    this.client.on('error', (err) => {
      this.logger.warn(`⚠️ Error de conexión a Redis: ${err.message}`);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  /**
   * Genera la lista de fechas individuales (noches) entre checkIn (inclusive) y checkOut (exclusive)
   */
  getDatesBetween(checkIn: string, checkOut: string): string[] {
    const dates: string[] = [];
    const curr = new Date(checkIn);
    const end = new Date(checkOut);

    while (curr < end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
    return dates;
  }

  /**
   * Intenta adquirir un bloqueo atómico temporal (Soft-Lock) para una habitación
   * en todas las noches del rango solicitado utilizando un script Lua para garantizar atomicidad total.
   */
  async acquireHold(
    holdId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    userId: string,
    ttlSeconds = 900,
  ): Promise<{ success: boolean; conflictingDate?: string }> {
    const nights = this.getDatesBetween(checkIn, checkOut);
    if (nights.length === 0) {
      return { success: false };
    }

    // Script Lua atómico:
    // 1. Verifica si alguna noche ya está bloqueada por otro hold.
    // 2. Si alguna está bloqueada, aborta y devuelve la fecha conflictiva.
    // 3. Si todas están libres, las bloquea con el holdId y TTL de 10 min.
    const luaScript = `
      local holdId = ARGV[1]
      local ttl = tonumber(ARGV[2])
      for i, key in ipairs(KEYS) do
        local current = redis.call('GET', key)
        if current and current ~= holdId then
          return {0, key}
        end
      end
      for i, key in ipairs(KEYS) do
        redis.call('SET', key, holdId, 'EX', ttl)
      end
      return {1, 'OK'}
    `;

    const keys = nights.map((night) => `lock:room:${roomId}:night:${night}`);

    try {
      const result: any = await this.client.eval(
        luaScript,
        keys.length,
        ...keys,
        holdId,
        ttlSeconds,
      );

      const [status, info] = result;
      if (status === 1) {
        // Guardar metadatos del hold
        const holdMetaKey = `hold:meta:${holdId}`;
        await this.client.set(
          holdMetaKey,
          JSON.stringify({
            holdId,
            roomId,
            checkIn,
            checkOut,
            userId,
            nights,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
          }),
          'EX',
          ttlSeconds,
        );

        this.logger.log(
          `🔒 Soft-lock adquirido [Hold: ${holdId}] para habitación ${roomId} (${nights.length} noches, TTL: ${ttlSeconds}s)`,
        );
        return { success: true };
      } else {
        const conflictingNight = info ? info.replace(`lock:room:${roomId}:night:`, '') : '';
        this.logger.warn(
          `⚠️ Conflicto de bloqueo en habitación ${roomId}: noche ${conflictingNight} ya ocupada por otro usuario`,
        );
        return { success: false, conflictingDate: conflictingNight };
      }
    } catch (err) {
      this.logger.error(`Error ejecutando script Lua en Redis: ${err.message}`);
      return { success: false };
    }
  }

  /**
   * Libera atómicamente el bloqueo de una habitación para el hold especificado
   */
  async releaseHold(holdId: string, roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const nights = this.getDatesBetween(checkIn, checkOut);
    const keys = nights.map((night) => `lock:room:${roomId}:night:${night}`);

    // Solo libera las llaves si pertenecen a este holdId específico
    const releaseScript = `
      local holdId = ARGV[1]
      for i, key in ipairs(KEYS) do
        if redis.call('GET', key) == holdId then
          redis.call('DEL', key)
        end
      end
      return 1
    `;

    try {
      await this.client.eval(releaseScript, keys.length, ...keys, holdId);
      await this.client.del(`hold:meta:${holdId}`);
      this.logger.log(`🔓 Soft-lock liberado exitosamente [Hold: ${holdId}] para habitación ${roomId}`);
      return true;
    } catch (err) {
      this.logger.error(`Error al liberar bloqueo en Redis: ${err.message}`);
      return false;
    }
  }

  /**
   * Verifica si una habitación tiene bloqueos temporales activos en Redis para el rango dado
   */
  async isRoomLocked(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const nights = this.getDatesBetween(checkIn, checkOut);
    for (const night of nights) {
      const key = `lock:room:${roomId}:night:${night}`;
      const locked = await this.client.get(key);
      if (locked) {
        return true;
      }
    }
    return false;
  }

  /**
   * Obtiene los días bloqueados en Redis para una habitación en un mes específico
   */
  async getLockedNightsForRoom(roomId: string, yearMonth: string): Promise<string[]> {
    // yearMonth = '2026-11'
    const pattern = `lock:room:${roomId}:night:${yearMonth}-*`;
    const keys = await this.client.keys(pattern);
    return keys.map((k) => k.replace(`lock:room:${roomId}:night:`, ''));
  }
}

