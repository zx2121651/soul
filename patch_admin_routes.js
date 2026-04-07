const fs = require('fs');
const file = 'soul-app-backend/src/routes/admin.routes.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('/voicerooms')) {
  const newRoute = `
router.get('/voicerooms', async (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const countRes = await db.query('SELECT COUNT(*) FROM voice_rooms');
    const total = parseInt(countRes.rows[0].count);

    const roomsRes = await db.query(\`
      SELECT v.id, v.uuid, v.title, v.tags, v.status, v.created_at,
             u.name as owner_name, u.avatar as owner_avatar
      FROM voice_rooms v
      JOIN users u ON v.owner_id = u.id
      ORDER BY v.created_at DESC
      LIMIT $1 OFFSET $2
    \`, [limit, offset]);

    sendSuccess(res, {
      items: roomsRes.rows,
      total
    });
  } catch (err) {
    sendError(res, ErrorCode.SYSTEM_ERROR, 'Failed to fetch voice rooms');
  }
});

export default router;`;

  content = content.replace('export default router;', newRoute);
  fs.writeFileSync(file, content);
}
