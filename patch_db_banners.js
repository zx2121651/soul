const fs = require('fs');
const file = 'soul-app-backend/src/db.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('CREATE TABLE IF NOT EXISTS banners')) {
  content = content.replace(
    'CREATE TABLE IF NOT EXISTS announcements (',
    `CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL,
        link TEXT DEFAULT '#',
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (`
  );

  content = content.replace(
    'await dbInstance.run("INSERT INTO chat_rooms (id) VALUES (1)");',
    `await dbInstance.run("INSERT INTO banners (image_url, link, sort_order) VALUES ('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', '#', 1)");
      await dbInstance.run("INSERT INTO banners (image_url, link, sort_order) VALUES ('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=60', '#', 2)");

      await dbInstance.run("INSERT INTO chat_rooms (id) VALUES (1)");`
  );

  fs.writeFileSync(file, content);
}
