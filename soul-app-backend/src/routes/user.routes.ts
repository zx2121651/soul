import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// --- Real DB Implementation ---
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();

    // Auth context injected by middleware
    const userId = req.user?.id || 1;
    const userUuid = req.user?.uuid || 'soul_123456';

    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, [userUuid]);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const user = userResult.rows[0];
    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);

    sendSuccess(res, {
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

router.put('/me/profile', authMiddleware, (req, res) => sendSuccess(res, req.body, '个人资料已更新'));

// --- User Relationship (Mock Implementation) ---
router.post('/:id/follow', (req, res) => sendSuccess(res, null, 'Followed'));
router.post('/:id/unfollow', (req, res) => sendSuccess(res, null, 'Unfollowed'));
router.get('/:id/followers', (req, res) => sendSuccess(res, { followers: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] }));
router.get('/:id/following', (req, res) => sendSuccess(res, { following: [{ id: 4, name: 'User 4' }] }));
router.post('/:id/block', (req, res) => sendSuccess(res, null, 'User blocked'));
router.post('/:id/unblock', (req, res) => sendSuccess(res, null, 'User unblocked'));
router.get('/blocked', (req, res) => sendSuccess(res, { blockedUsers: [] }));
router.post('/:id/report', (req, res) => sendSuccess(res, null, 'Report submitted successfully'));
router.get('/:id/profile', (req, res) => sendSuccess(res, { id: req.params.id, name: 'Mock User', bio: 'Hello world' }));

export default router;
