import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'soul_app',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  const client = await pool.connect();

  try {
    console.log('Running migrations...');

    // 1. Schema
    const schemaPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('✅ Base Schema and Indexes applied.');

    // 2. Seeds
    const seedPath = path.join(__dirname, '../migrations/002_seed_data.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query('BEGIN');
    await client.query(seedSql);
    await client.query('COMMIT');
    console.log('✅ Seed data inserted.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
