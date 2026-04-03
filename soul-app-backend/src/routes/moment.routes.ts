import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// --- Real DB Implementation ---
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { content, type, url } = req.body;
    const db = getDb();
    const userUuid = req.user?.uuid || 'soul_123456';

    const userResult = await db.query(`SELECT id FROM users WHERE uuid = $1`, [userUuid]);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const insertResult = await db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userResult.rows[0].id, type || 'text', content || '', url || null]);

    sendSuccess(res, { moment: insertResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// --- Mock Implementations ---
router.post('/:id/like', (req, res) => sendSuccess(res, { newLikesCount: Math.floor(Math.random() * 100) }, `Liked post ${req.params.id}`));
router.get('/:id/comments', (req, res) => sendSuccess(res, { comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] }));
router.post('/:id/comments', (req, res) => sendSuccess(res, { comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } }));
router.delete('/:id', (req, res) => sendSuccess(res, null, 'Post deleted'));
router.post('/:id/share', (req, res) => sendSuccess(res, { shareUrl: 'https://soul.app/p/123' }));

export default router;
