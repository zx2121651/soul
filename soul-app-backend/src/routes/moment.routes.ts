import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { MomentService } from '../services/moment.service';

const router = Router();
const momentService = new MomentService();

// --- Real DB Implementation ---
// 获取广场动态列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const posts = await momentService.getExploreMoments();
    // 构造 ExploreResponse 需要的字段，目前为了兼容前端也可以放进 explore 对象里，或者直接返回
    sendSuccess(res, {
      explore: {
        banners: [
          { id: 1, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', link: '#' },
          { id: 2, imageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=60', link: '#' }
        ],
        trendingTopics: [
          { id: 101, title: '# 寻找同频的你', participants: 12500 },
          { id: 102, title: '# 周末去哪儿', participants: 8300 }
        ],
        posts,
        voiceRooms: []
      }
    });
  } catch (error) {
    next(error);
  }
});

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
