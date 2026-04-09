import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { MomentService } from '../services/moment.service';
import { validate } from '../middlewares/validate.middleware';
import { createMomentSchema } from '../validations/moment.validation';

const router = Router();
const momentService = new MomentService();

// --- Real DB Implementation ---
// 获取广场动态列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const viewerUuid = req.user?.uuid || 'soul_123456';
    // const posts = await momentService.getExploreMoments(viewerUuid); // 简单的基于时间流(Timeline)的分页

    // 🔥 调用最新接入的极度复杂的推荐系统算法！
    const posts = await momentService.getFeedRecommends(viewerUuid, 20);
    // 构造 ExploreResponse 需要的字段，目前为了兼容前端也可以放进 explore 对象里，或者直接返回
    sendSuccess(res, {
      explore: {
        banners: await require('../db').getDb().banner.findMany({ where: { status: 'active' }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }], take: 5, select: { id: true, imageUrl: true, link: true } }),
        // 热门话题，真实场景应由算法或聚合查询得出
        trendingTopics: [
          { id: 101, title: '# 寻找同频的灵魂', participants: Math.floor(Math.random() * 50000) + 10000 },
          { id: 102, title: '# 星际漫游日记', participants: Math.floor(Math.random() * 20000) + 5000 },
          { id: 103, title: '# 异星穿搭指南', participants: Math.floor(Math.random() * 10000) + 2000 }
        ],
        posts,
        voiceRooms: []
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, validate(createMomentSchema), async (req, res, next) => {
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
