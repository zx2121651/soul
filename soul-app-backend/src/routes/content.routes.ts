import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

// --- 真实的星球(Planet)居民数据 ---
router.get('/planet', async (req, res) => {
  try {
    const db = require('../db').getDb();

    // 使用 Prisma 查询
    const users = await db.user.findMany({
      where: { status: 'active', uuid: { not: 'soul_bot_001' } },
      take: 30,
      select: { id: true, name: true }
    });

    const nodes = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      match: Math.floor(60 + Math.random() * 40)
    }));

    sendSuccess(res, { nodes });
  } catch (err) {
    console.error('Planet fetch error:', err);
    sendSuccess(res, { nodes: [] });
  }
});

// --- Public Announcements ---
router.get('/announcements', async (req, res) => {
  try {
    const db = require('../db').getDb();
    const anns = await db.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    sendSuccess(res, { latest: anns[0] || null });
  } catch (err) {
    sendSuccess(res, { latest: null }); // 静默失败
  }
});

export default router;
