import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private useMemoryFallback = false;
  private readonly memoryLocks = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly configService: ConfigService) {}

  private purgeExpiredMemoryLocks() {
    const now = Date.now();
    for (const [k, v] of this.memoryLocks.entries()) {
      if (v.expiresAt <= now) {
        this.memoryLocks.delete(k);
      }
    }
  }

  onModuleInit() {
    const redisUrl = (this.configService.get<string>('REDIS_URL') || '').trim();
    const host = (this.configService.get<string>('REDIS_HOST') || '').trim();
    const port = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);

    // En producción sin REDIS_URL ni REDIS_HOST, usar bloqueos en memoria TTL automáticamente
    if (!redisUrl && !host && this.configService.get<string>('NODE_ENV') === 'production') {
      this.useMemoryFallback = true;
      this.logger.log('🟡 Redis externo no configurado: usando motor de bloqueos TTL en memoria.');
      return;
    }

    const commonOpts = {
      retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 1500)),
      maxRetriesPerRequest: 2,
      connectTimeout: 3000,
    };

    if (redisUrl) {
      this.client = new Redis(redisUrl, {
        ...commonOpts,
        tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      });
    } else {
      this.client = new Redis({
        host: host || 'localhost',
        port,
        password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        ...commonOpts,
      });
    }

    this.client.on('connect', () => {
      this.useMemoryFallback = false;
      this.logger.log(`🟢 Conexión exitosa a Redis (${redisUrl ? 'REDIS_URL' : `${host || 'localhost'}:${port}`})`);
    });

    this.client.on('error', (err) => {
      this.useMemoryFallback = true;
      this.logger.warn(`⚠️ Redis no disponible (${err.message}). Activando respaldo de bloqueos TTL en memoria.`);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  getClient(): Redis | null {
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

    const acquireInMemory = (): { success: boolean; conflictingDate?: string } => {
      this.purgeExpiredMemoryLocks();
      for (const key of keys) {
        const existing = this.memoryLocks.get(key);
        if (existing && existing.value !== holdId) {
          return { success: false, conflictingDate: key.replace(`lock:room:${roomId}:night:`, '') };
        }
      }
      const expiresAt = Date.now() + ttlSeconds * 1000;
      for (const key of keys) {
        this.memoryLocks.set(key, { value: holdId, expiresAt });
      }
      return { success: true };
    };

    if (this.useMemoryFallback || !this.client || this.client.status !== 'ready') {
      return acquireInMemory();
    }

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
      this.logger.warn(`Redis no respondió (${err.message}); aplicando bloqueo TTL en memoria.`);
      this.useMemoryFallback = true;
      return acquireInMemory();
    }
  }

  /**
   * Libera atómicamente el bloqueo de una habitación para el hold especificado
   */
  async releaseHold(holdId: string, roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const nights = this.getDatesBetween(checkIn, checkOut);
    const keys = nights.map((night) => `lock:room:${roomId}:night:${night}`);

    for (const key of keys) {
      const existing = this.memoryLocks.get(key);
      if (existing && existing.value === holdId) {
        this.memoryLocks.delete(key);
      }
    }

    if (this.useMemoryFallback || !this.client || this.client.status !== 'ready') {
      return true;
    }

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
      this.logger.warn(`Error al liberar bloqueo en Redis (${err.message}); liberado en memoria.`);
      return true;
    }
  }

  /**
   * Verifica si una habitación tiene bloqueos temporales activos en Redis para el rango dado
   */
  async isRoomLocked(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const nights = this.getDatesBetween(checkIn, checkOut);
    if (this.useMemoryFallback || !this.client || this.client.status !== 'ready') {
      this.purgeExpiredMemoryLocks();
      return nights.some((night) => this.memoryLocks.has(`lock:room:${roomId}:night:${night}`));
    }
    try {
      for (const night of nights) {
        const key = `lock:room:${roomId}:night:${night}`;
        const locked = await this.client.get(key);
        if (locked) {
          return true;
        }
      }
      return false;
    } catch {
      this.purgeExpiredMemoryLocks();
      return nights.some((night) => this.memoryLocks.has(`lock:room:${roomId}:night:${night}`));
    }
  }

  /**
   * Obtiene los días bloqueados en Redis para una habitación en un mes específico
   */
  async getLockedNightsForRoom(roomId: string, yearMonth: string): Promise<string[]> {
    const prefix = `lock:room:${roomId}:night:`;
    if (this.useMemoryFallback || !this.client || this.client.status !== 'ready') {
      this.purgeExpiredMemoryLocks();
      const result: string[] = [];
      for (const k of this.memoryLocks.keys()) {
        if (k.startsWith(`${prefix}${yearMonth}-`)) {
          result.push(k.replace(prefix, ''));
        }
      }
      return result;
    }
    try {
      const pattern = `${prefix}${yearMonth}-*`;
      const keys = await this.client.keys(pattern);
      return keys.map((k) => k.replace(prefix, ''));
    } catch {
      return [];
    }
  }
}

