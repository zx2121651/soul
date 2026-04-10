const fs = require('fs');
const file = 'soul-app-backend/src/routes/moment.routes.ts';
let content = fs.readFileSync(file, 'utf8');

// 增加 GET /moments/:id 和 POST /moments/:id/comments 接口
const detailRoutes = `
// ==================== 瞬间详情与评论 ====================
router.get('/:id', async (req, res, next) => {
  try {
    const db = require('../db').getDb();
    const momentId = parseInt(req.params.id, 10);

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
    const momentId = parseInt(req.params.id, 10);
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
`;

if (!content.includes("router.post('/:id/comments'")) {
  content += detailRoutes;
  fs.writeFileSync(file, content);
}
