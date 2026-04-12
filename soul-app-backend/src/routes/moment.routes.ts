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

// ==================== 瞬间详情与评论 ====================
router.get('/:id', async (req, res, next) => {
  try {
    const db = require('../db').getDb();
    const momentId = parseInt(req.params.id as string, 10);

    // 查询主贴详情
    const m = await db.moment.findUnique({
      where: { id: momentId, status: 'active' },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        tags: { select: { tagName: true } },
        _count: { select: { comments: true, likes: true } }
      }
    });

    if (!m) return sendError(res, 404, '动态不存在或已被下架');

    // 简单查是否当前点过赞 (如果是带 token 可以做)
    let isLiked = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      // 简化处理，实际上应该提取 req.user
      // 这只是读取不需要强校验，所以简化
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'soul-secret');
        const user = await db.user.findUnique({ where: { uuid: decoded.uuid } });
        if (user) {
           const like = await db.momentLike.findUnique({ where: { userId_momentId: { userId: user.id, momentId } } });
           isLiked = !!like;
        }
      } catch (e) {}
    }

    const momentDto = {
      id: m.id,
      author: m.author,
      text: m.content,
      image: m.url,
      type: m.type,
      tags: m.tags.map((t: any) => t.tagName),
      time: m.createdAt.toISOString(),
      initialLikes: m.likesCount,
      isLiked,
      comments: m._count.comments,
    };

    // 查询前 50 条最新评论
    const commentsList = await db.momentComment.findMany({
      where: { momentId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });

    const commentsDto = commentsList.map((c: any) => ({
      id: c.id,
      content: c.content,
      author: c.author,
      time: c.createdAt.toLocaleString()
    }));

    sendSuccess(res, { moment: momentDto, comments: commentsDto });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', authMiddleware, async (req, res, next) => {
  try {
    const db = require('../db').getDb();
    const momentId = parseInt(req.params.id as string, 10);
    const { content } = req.body;
    if (!content) return sendError(res, 400, '评论内容不能为空');

    const userUuid = req.user?.uuid || 'soul_123456';
    const user = await db.user.findUnique({ where: { uuid: userUuid } });
    if (!user) return sendError(res, 401, '用户未登录');

    const newComment = await db.$transaction(async (tx: any) => {
      const c = await tx.momentComment.create({
        data: { momentId, authorId: user.id, content, status: 'active' },
        include: { author: { select: { id: true, name: true, avatar: true } } }
      });

      // 更新评论总数
      await tx.moment.update({
        where: { id: momentId },
        data: { commentsCount: { increment: 1 } }
      });
      return c;
    });

    const commentDto = {
      id: newComment.id,
      content: newComment.content,
      author: newComment.author,
      time: '刚刚'
    };

    sendSuccess(res, { comment: commentDto }, '评论发表成功');
  } catch (err) {
    next(err);
  }
});
