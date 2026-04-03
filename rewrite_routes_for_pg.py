import re

with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

# Route /me
pg_me_replacement = """
// --- Me Data (Powered by PostgreSQL DB) ---
router.get('/me', async (req, res) => {
  try {
    const db = getDb();

    // Quick fallback if DB is not connected yet during testing
    try {
        await db.query('SELECT 1');
    } catch(e) {
        return res.json({ profile: { name: 'DB Not Connected' }, moments: [] });
    }

    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);

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
      moments: momentsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
"""
content = re.sub(r"// --- Me Data \(Powered by SQLite DB\).*?}\);\n\n\n// --- State for Moments ---", pg_me_replacement + "\n\n// --- State for Moments ---", content, flags=re.DOTALL)


# Route /moments
pg_moments_replacement = """
// --- Moment Post logic (Powered by PostgreSQL DB) ---
router.post('/moments', async (req, res) => {
  try {
    const { content, type, url } = req.body;
    const db = getDb();

    const userResult = await db.query(`SELECT id FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    const userId = userResult.rows[0].id;

    const insertResult = await db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userId, type || 'text', content || '', url || null]);

    res.json({ success: true, moment: insertResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
"""

content = re.sub(r"// --- Moment Post logic \(Powered by SQLite DB\).*?}\);", pg_moments_replacement, content, flags=re.DOTALL)

with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
