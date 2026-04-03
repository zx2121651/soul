import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  return dbInstance;
}

export async function initDb() {
  const db = await getDb();

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      followers INTEGER DEFAULT 0,
      following INTEGER DEFAULT 0,
      visitors INTEGER DEFAULT 0
    );
  `);

  // Create Moments Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Seed Data (if empty)
  const userCount = await db.get(`SELECT COUNT(*) as count FROM users`);
  if (userCount.count === 0) {
    console.log('Seeding initial data into database...');

    // Insert Me (Default User)
    await db.run(`
      INSERT INTO users (uuid, name, avatar, bio, followers, following, visitors)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['soul_123456', '一只小透明', 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2', '寻找宇宙中的同频共振 ✨', 128, 56, 342]);

    const user = await db.get(`SELECT id FROM users WHERE uuid = 'soul_123456'`);

    // Insert Initial Moments
    await db.run(`
      INSERT INTO moments (user_id, type, content)
      VALUES (?, ?, ?)
    `, [user.id, 'text', '保持热爱，奔赴山海']);

    await db.run(`
      INSERT INTO moments (user_id, type, url)
      VALUES (?, ?, ?)
    `, [user.id, 'image', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=600&fit=crop']);

    console.log('Database seeding complete.');
  } else {
    console.log('Database already initialized.');
  }
}
