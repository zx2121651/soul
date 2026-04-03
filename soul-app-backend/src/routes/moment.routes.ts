import { Router } from 'express';
import { getDb } from '../db';
import { sendError } from '../utils/response';

const router = Router();

// --- Real DB Implementation ---
router.post('/', async (req, res, next) => {
  try {
    const { content, type, url } = req.body;
    const db = getDb();

    const userResult = await db.query(`SELECT id FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const insertResult = await db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userResult.rows[0].id, type || 'text', content || '', url || null]);

    res.json({ success: true, moment: insertResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// --- Mock Implementations ---
router.post('/:id/like', (req, res) => res.json({ success: true, message: `Liked post ${req.params.id}`, newLikesCount: Math.floor(Math.random() * 100) }));
router.get('/:id/comments', (req, res) => res.json({ comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] }));
router.post('/:id/comments', (req, res) => res.json({ success: true, comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } }));
router.delete('/:id', (req, res) => res.json({ success: true, message: 'Post deleted' }));
router.post('/:id/share', (req, res) => res.json({ success: true, shareUrl: 'https://soul.app/p/123' }));

export default router;
