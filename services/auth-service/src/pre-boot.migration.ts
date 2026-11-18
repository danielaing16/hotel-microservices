import { Logger } from '@nestjs/common';
import { Client } from 'pg';

/**
 * Migración previa al arranque (corre ANTES de que TypeORM sincronice el esquema).
 *
 * El rol RECEPTIONIST fue eliminado del enum. Si quedan filas con ese valor,
 * la sincronización del enum de Postgres falla y el servicio no arranca.
 * Por eso, antes de iniciar Nest, se convierten esas cuentas a HOTEL_ADMIN
 * (el Administrador absorbe las funciones de recepción).
 *
 * Es idempotente y tolerante: si la tabla aún no existe o la BD no está
 * disponible, simplemente no hace nada.
 */
export async function runPreBootMigrations(): Promise<void> {
  const logger = new Logger('PreBootMigration');
  const databaseUrl = process.env.DATABASE_URL;
  const useSsl =
    process.env.DB_SSL === 'true' ||
    Boolean(databaseUrl && /sslmode=require|neon\.tech|render\.com|supabase/i.test(databaseUrl));

  const client = databaseUrl
    ? new Client({
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      })
    : new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres123',
        database: process.env.DB_DATABASE || 'hotel_auth_db',
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      });

  try {
    await client.connect();
    const table = await client.query(`SELECT to_regclass('public.users') AS t`);
    if (!table.rows[0]?.t) return;

    // La cuenta demo de recepción tiene contraseña pública: se elimina en vez de
    // promoverla a administrador.
    await client.query(
      `DELETE FROM users WHERE email = 'recepcion@hotel.com' AND role::text = 'RECEPTIONIST'`,
    );

    const res = await client.query(
      `UPDATE users SET role = 'HOTEL_ADMIN' WHERE role::text = 'RECEPTIONIST'`,
    );
    if (res.rowCount) {
      logger.log(`${res.rowCount} cuenta(s) RECEPTIONIST migradas a HOTEL_ADMIN.`);
    }
  } catch (err) {
    logger.warn(`Migración previa omitida: ${(err as Error).message}`);
  } finally {
    await client.end().catch(() => undefined);
  }
}
