import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'soul_app',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });
  }
  return pool;
}

export async function initDb() {
  const db = getDb();

  try {
    await db.query('SELECT NOW()');
    console.log('✅ Successfully connected to PostgreSQL database.');
  } catch (err) {
    console.error('❌ Could not connect to PostgreSQL database. Exiting process.');
    console.error('   Please make sure PostgreSQL is running (e.g. docker-compose up -d).');
    process.exit(1);
  }
}
