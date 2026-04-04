import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
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
    if (error.message === 'User not found') return sendError(res, 404, error.message);
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
