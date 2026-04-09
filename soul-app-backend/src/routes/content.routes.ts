import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

// --- 真实的星球(Planet)居民数据 ---
router.get('/planet', async (req, res) => {
  try {
    const db = require('../db').getDb();
    // 随机抽取最多 30 个处于正常状态的星球居民
    const result = await db.query(
      "SELECT id, name FROM users WHERE (status = 'active' OR status IS NULL) AND uuid != 'soul_bot_001' ORDER BY RANDOM() LIMIT 30"
    );

    const nodes = result.rows.map((u: any) => ({
      id: u.id,
      name: u.name,
      match: Math.floor(60 + Math.random() * 40) // 匹配度暂时保持前端随机展示效果
    }));

    sendSuccess(res, { nodes });
  } catch (err) {
    console.error('Planet fetch error:', err);
    sendSuccess(res, { nodes: [] });
  }
});

// --- 遗留废弃的 Mock 路由已清理 ---

export default router;

// --- Public Announcements ---
router.get('/announcements', async (req, res) => {
  try {
    const db = require('../db').getDb();
    const result = await db.query(
      "SELECT title, content, type FROM announcements ORDER BY created_at DESC LIMIT 1"
    );
    sendSuccess(res, { latest: result.rows[0] || null });
  } catch (err) {
    sendSuccess(res, { latest: null }); // 静默失败
  }
});
