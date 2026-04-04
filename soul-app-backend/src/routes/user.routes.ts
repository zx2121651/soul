import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService();

// --- Real DB Implementation ---
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userUuid = req.user?.uuid || 'soul_123456';
    const data = await userService.getMeProfile(userUuid);
    sendSuccess(res, data);
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, error.message);
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
