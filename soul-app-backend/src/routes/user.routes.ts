import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';
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
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

router.put('/me/profile', authMiddleware, (req, res) => sendSuccess(res, req.body, '个人资料已更新'));



// --- Advanced Real DB Implementations ---
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q as string || '';
    const results = await userService.search(q);
    sendSuccess(res, { results });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const topUsers = await userService.getTopUsers();
    sendSuccess(res, { topUsers });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/follow', authMiddleware, async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id as string, 10);
    const userUuid = req.user?.uuid || 'soul_123456';
    await userService.followUser(userUuid, targetId);
    sendSuccess(res, null, 'Followed');
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

router.delete('/:id/follow', authMiddleware, async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id as string, 10);
    const userUuid = req.user?.uuid || 'soul_123456';
    await userService.unfollowUser(userUuid, targetId);
    sendSuccess(res, null, 'Unfollowed');
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

export default router;
