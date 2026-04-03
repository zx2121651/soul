import re

with open('soul-app-backend/src/routes/index.ts', 'r') as f:
    content = f.read()

fallback_logic = """
router.get('/me', async (req, res, next) => {
  try {
    const db = getDb();
    try {
        await db.query('SELECT 1');
    } catch(e) {
        return res.json({ profile: { name: '一只小透明(Mock Mode)' }, moments: [] });
    }
    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];
    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);
    res.json({
      profile: { name: user.name, id: user.uuid, avatar: user.avatar, followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio },
      moments: momentsResult.rows
    });
  } catch (error) {
    next(error);
  }
});
"""

content = re.sub(r"router\.get\('/me', async \(req, res, next\) => \{.*?  \} catch \(error\) \{\n    next\(error\);\n  \}\n\}\);", fallback_logic, content, flags=re.DOTALL)

with open('soul-app-backend/src/routes/index.ts', 'w') as f:
    f.write(content)
