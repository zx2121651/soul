import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { MomentService } from '../services/moment.service';

const router = Router();
const momentService = new MomentService();

// --- Real DB Implementation ---
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { content, type, url } = req.body;
    const userUuid = req.user?.uuid || 'soul_123456';

    const newMoment = await momentService.createMoment(userUuid, type || 'text', content || null, url || null);
    sendSuccess(res, { moment: newMoment });
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});



router.post('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const momentId = parseInt(req.params.id as string, 10);
    const userUuid = req.user?.uuid || 'soul_123456';
    const isLike = req.body.like !== false; // default true

    await momentService.toggleLike(userUuid, momentId, isLike);
    sendSuccess(res, null, isLike ? 'Liked' : 'Unliked');
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

export default router;
