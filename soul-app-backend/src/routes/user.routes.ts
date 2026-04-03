import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// --- Real DB Implementation ---
router.get('/me', async (req, res, next) => {
  try {
    const db = getDb();
    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const user = userResult.rows[0];
    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);

    // For backward compatibility with frontend, return flat structure for now or mapped
    // We keep the old structure but wrap it in the new response formatter if needed.
    // Notice: to not break existing frontend, we might just send raw json, but let's standardise if possible.
    // The frontend currently expects: data.profile, data.moments
    res.json({
      profile: {
        name: user.name, id: user.uuid, avatar: user.avatar,
        followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio
      },
      moments: momentsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

router.put('/me/profile', (req, res) => res.json({ success: true, message: '个人资料已更新', updatedData: req.body }));

// --- User Relationship (Mock Implementation) ---
router.post('/:id/follow', (req, res) => res.json({ success: true, message: 'Followed' }));
router.post('/:id/unfollow', (req, res) => res.json({ success: true, message: 'Unfollowed' }));
router.get('/:id/followers', (req, res) => res.json({ followers: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] }));
router.get('/:id/following', (req, res) => res.json({ following: [{ id: 4, name: 'User 4' }] }));
router.post('/:id/block', (req, res) => res.json({ success: true, message: 'User blocked' }));
router.post('/:id/unblock', (req, res) => res.json({ success: true, message: 'User unblocked' }));
router.get('/blocked', (req, res) => res.json({ blockedUsers: [] }));
router.post('/:id/report', (req, res) => res.json({ success: true, message: 'Report submitted successfully' }));
router.get('/:id/profile', (req, res) => res.json({ id: req.params.id, name: 'Mock User', bio: 'Hello world' }));

export default router;
