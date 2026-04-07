const fs = require('fs');
const file = 'soul-app-backend/src/routes/admin.routes.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('delete(\'/moments/:id')) {
  const newRoute = `
router.delete('/moments/:id', async (req, res) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id);
    await db.query('DELETE FROM moments WHERE id = $1', [id]);
    sendSuccess(res, null, 'Deleted successfully');
  } catch (err) {
    sendError(res, ErrorCode.SYSTEM_ERROR, 'Failed to delete moment');
  }
});

export default router;`;

  content = content.replace('export default router;', newRoute);
  fs.writeFileSync(file, content);
}
