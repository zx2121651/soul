import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: any = null;

class SqlitePoolWrapper {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async query(text: string, params?: any[]) {
    let sqliteText = text;
    if (sqliteText.includes('$')) {
      sqliteText = sqliteText.replace(/\$[0-9]+/g, '?');
    }

    if (sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.includes('RETURNING') || sqliteText.includes('returning')) {
      const rows = await this.db.all(sqliteText, params || []);
      return { rows, rowCount: rows.length };
    } else {
      const result = await this.db.run(sqliteText, params || []);
      return { rows: [], rowCount: result.changes };
    }
  }
}

let wrapperInstance: SqlitePoolWrapper | null = null;

export function getDb(): any {
  if (!wrapperInstance) {
    throw new Error('Database not initialized');
  }
  return wrapperInstance;
}

export async function initDb() {
  try {
    const dbPath = path.resolve(process.cwd(), 'temp_memory_db.sqlite');
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    wrapperInstance = new SqlitePoolWrapper(dbInstance);

    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL,
        link TEXT DEFAULT '#',
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        admin_id INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS moments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT DEFAULT 'text',
        content TEXT,
        url TEXT,
        likes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS moment_likes (
        user_id INTEGER NOT NULL,
        moment_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, moment_id)
      );

      CREATE TABLE IF NOT EXISTS voice_rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        host_id INTEGER NOT NULL,
        online_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_room_members (
        room_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await dbInstance.run("INSERT INTO users (uuid, phone, password_hash, name, avatar, bio) VALUES ('soul_123456', '13800138000', 'hash', '当前用户(Me)', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Me&backgroundColor=ffdfbf', 'Hello world')");
      await dbInstance.run("INSERT INTO users (uuid, phone, password_hash, name, avatar, bio) VALUES ('user_2', '13800138001', 'hash', '夏天🌿', 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede', '热爱生活')");
      await dbInstance.run("INSERT INTO users (uuid, phone, password_hash, name, avatar, bio) VALUES ('user_3', '13800138002', 'hash', '陈子豪', 'https://api.dicebear.com/7.x/adventurer/svg?seed=chen&backgroundColor=b6e3f4', '摄影师')");

      await dbInstance.run("INSERT INTO voice_rooms (name, host_id, online_count) VALUES ('午夜心碎俱乐部', 2, 45)");
      await dbInstance.run("INSERT INTO voice_rooms (name, host_id, online_count) VALUES ('一起听歌', 3, 12)");
      await dbInstance.run("INSERT INTO announcements (title, content, type) VALUES ('欢迎来到 SOUL OS', '全新元宇宙社交枢纽已经启动，请遵守星际法则，愉快交流！', 'system')");
      await dbInstance.run("INSERT INTO banners (image_url, link, sort_order) VALUES ('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', '#', 1)");
      await dbInstance.run("INSERT INTO banners (image_url, link, sort_order) VALUES ('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=60', '#', 2)");

      await dbInstance.run("INSERT INTO chat_rooms (id) VALUES (1)");
      await dbInstance.run("INSERT INTO chat_room_members (room_id, user_id) VALUES (1, 1), (1, 2)");
      await dbInstance.run("INSERT INTO chat_messages (room_id, sender_id, text) VALUES (1, 2, '你好呀！')");

      await dbInstance.run("INSERT INTO moments (user_id, type, content, likes) VALUES (2, 'text', '今天天气真不错，适合出去玩！', 10)");
      await dbInstance.run("INSERT INTO moments (user_id, type, content, url, likes) VALUES (3, 'image', '新拍的照片', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', 5)");
    } catch(e) {}

    console.log('✅ Successfully connected to SQLite database (Temp).');
  } catch (err) {
    console.error('❌ Could not connect to SQLite database. Exiting process.', err);
    process.exit(1);
  }
}
