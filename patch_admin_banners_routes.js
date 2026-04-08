const fs = require('fs');
const file = 'soul-app-backend/src/routes/admin.routes.ts';
let content = fs.readFileSync(file, 'utf8');

const additionalRoutes = `
// ==================== BANNERS (轮播海报) ====================

// 获取轮播海报列表
router.get('/banners', async (req, res) => {
  try {
    const db = getDb();
    const countRes = await db.query("SELECT COUNT(*) FROM banners WHERE status = 'active'");
    const total = countRes.rows[0].count || countRes.rows[0]['COUNT(*)'] || 0;

    const listRes = await db.query(\`
      SELECT id, image_url, link, sort_order, created_at
      FROM banners
      WHERE status = 'active'
      ORDER BY sort_order ASC, created_at DESC
    \`);

    sendSuccess(res, { items: listRes.rows, total });
  } catch (err) {
    sendError(res, 500, '获取轮播海报失败');
  }
});

// 新增轮播海报
router.post('/banners', async (req, res) => {
  try {
    const db = getDb();
    const { image_url, link = '#', sort_order = 0 } = req.body;

    if (!image_url) return sendError(res, 400, '海报图片链接不能为空');

    const insertResult = await db.query(\`
      INSERT INTO banners (image_url, link, sort_order)
      VALUES ($1, $2, $3)
      RETURNING id, image_url, link, sort_order, created_at
    \`, [image_url, link, sort_order]);

    sendSuccess(res, insertResult.rows[0], '海报配置成功');
  } catch (err) {
    sendError(res, 500, '新增轮播海报失败');
  }
});

// 下架(删除)轮播海报
router.delete('/banners/:id', async (req, res) => {
  try {
    const db = getDb();
    const bannerId = parseInt(req.params.id, 10);
    // 使用软删除
    await db.query("UPDATE banners SET status = 'deleted' WHERE id = $1", [bannerId]);
    sendSuccess(res, null, '海报已下架');
  } catch (err) {
    sendError(res, 500, '海报下架失败');
  }
});
`;

if (!content.includes("router.get('/banners'")) {
  content += additionalRoutes;
  fs.writeFileSync(file, content);
}

const momentFile = 'soul-app-backend/src/routes/moment.routes.ts';
let momentContent = fs.readFileSync(momentFile, 'utf8');

// 修改时刻接口使前端手机端能拉取真实的 banner
momentContent = momentContent.replace(
  `banners: [
          { id: 1, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', link: '#' },
          { id: 2, imageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=60', link: '#' }
        ],`,
  `banners: (await require('../db').getDb().query("SELECT id, image_url as \\"imageUrl\\", link FROM banners WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC LIMIT 5")).rows,`
);

fs.writeFileSync(momentFile, momentContent);
