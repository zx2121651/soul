import re

with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

# Add db import at the top
if "import { getDb } from './db';" not in content:
    content = content.replace("import { Router } from 'express';", "import { Router } from 'express';\nimport { getDb } from './db';")

# Replace Me and Moments routes
me_replacement = """
// --- Me Data (Powered by SQLite DB) ---
router.get('/me', async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get(`SELECT * FROM users WHERE uuid = ?`, ['soul_123456']);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const moments = await db.all(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = ? ORDER BY id DESC`, [user.id]);

    res.json({
      profile: {
        name: user.name,
        id: user.uuid,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        visitors: user.visitors,
        bio: user.bio
      },
      moments: moments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
"""

# Regex match the exact block to replace the `/me` route
content = re.sub(r"// --- Me Data ---.*?}\);\n\n\n// --- State for Moments ---", me_replacement + "\n\n// --- State for Moments ---", content, flags=re.DOTALL)

moment_replacement = """
// --- Moment Post logic (Powered by SQLite DB) ---
router.post('/moments', async (req, res) => {
  try {
    const { content, type, url } = req.body;
    const db = await getDb();

    // Get current user id
    const user = await db.get(`SELECT id FROM users WHERE uuid = ?`, ['soul_123456']);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await db.run(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES (?, ?, ?, ?)
    `, [user.id, type || 'text', content || '', url || null]);

    const newMoment = await db.get(`SELECT id, type, content, url, created_at FROM moments WHERE id = ?`, [result.lastID]);

    res.json({ success: true, moment: newMoment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
"""

# Replace moment post route
content = re.sub(r"// --- Moment Post logic ---.*?}\);", moment_replacement, content, flags=re.DOTALL)

with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
