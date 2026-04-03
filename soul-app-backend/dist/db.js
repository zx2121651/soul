"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.initDb = initDb;
const pg_1 = require("pg");
let pool = null;
function getDb() {
    if (!pool) {
        // 默认连接本地的 postgres 数据库，可在环境变量中覆盖
        pool = new pg_1.Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'soul_app',
            password: process.env.DB_PASSWORD || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432', 10),
        });
    }
    return pool;
}
function initDb() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = getDb();
        try {
            // 检查连接是否成功
            yield db.query('SELECT NOW()');
            console.log('Successfully connected to PostgreSQL database.');
        }
        catch (err) {
            console.warn('⚠️ Could not connect to PostgreSQL database. Please make sure PostgreSQL is running.');
            console.warn('   You can start it using: docker-compose up -d');
            console.warn('   Will skip DB initialization for now.');
            return;
        }
        // Create Users Table
        yield db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      uuid VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      avatar TEXT,
      bio TEXT,
      followers INTEGER DEFAULT 0,
      following INTEGER DEFAULT 0,
      visitors INTEGER DEFAULT 0
    );
  `);
        // Create Moments Table
        yield db.query(`
    CREATE TABLE IF NOT EXISTS moments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type VARCHAR(50) NOT NULL,
      content TEXT,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
        // Seed Data (if empty)
        const userCountResult = yield db.query(`SELECT COUNT(*) FROM users`);
        const count = parseInt(userCountResult.rows[0].count, 10);
        if (count === 0) {
            console.log('Seeding initial data into PostgreSQL database...');
            // Insert Me (Default User)
            yield db.query(`
      INSERT INTO users (uuid, name, avatar, bio, followers, following, visitors)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, ['soul_123456', '一只小透明', 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2', '寻找宇宙中的同频共振 ✨', 128, 56, 342]);
            const userResult = yield db.query(`SELECT id FROM users WHERE uuid = 'soul_123456'`);
            const userId = userResult.rows[0].id;
            // Insert Initial Moments
            yield db.query(`
      INSERT INTO moments (user_id, type, content)
      VALUES ($1, $2, $3)
    `, [userId, 'text', '保持热爱，奔赴山海']);
            yield db.query(`
      INSERT INTO moments (user_id, type, url)
      VALUES ($1, $2, $3)
    `, [userId, 'image', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=600&fit=crop']);
            console.log('Database seeding complete.');
        }
        else {
            console.log('PostgreSQL Database already initialized.');
        }
    });
}
