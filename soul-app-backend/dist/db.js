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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.initDb = initDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
let dbInstance = null;
function getDb() {
    return __awaiter(this, void 0, void 0, function* () {
        if (dbInstance) {
            return dbInstance;
        }
        dbInstance = yield (0, sqlite_1.open)({
            filename: './database.sqlite',
            driver: sqlite3_1.default.Database
        });
        return dbInstance;
    });
}
function initDb() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield getDb();
        // Create Users Table
        yield db.exec(`
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
        yield db.exec(`
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
        const userCount = yield db.get(`SELECT COUNT(*) as count FROM users`);
        if (userCount.count === 0) {
            console.log('Seeding initial data into database...');
            // Insert Me (Default User)
            yield db.run(`
      INSERT INTO users (uuid, name, avatar, bio, followers, following, visitors)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['soul_123456', '一只小透明', 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2', '寻找宇宙中的同频共振 ✨', 128, 56, 342]);
            const user = yield db.get(`SELECT id FROM users WHERE uuid = 'soul_123456'`);
            // Insert Initial Moments
            yield db.run(`
      INSERT INTO moments (user_id, type, content)
      VALUES (?, ?, ?)
    `, [user.id, 'text', '保持热爱，奔赴山海']);
            yield db.run(`
      INSERT INTO moments (user_id, type, url)
      VALUES (?, ?, ?)
    `, [user.id, 'image', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=600&fit=crop']);
            console.log('Database seeding complete.');
        }
        else {
            console.log('Database already initialized.');
        }
    });
}
