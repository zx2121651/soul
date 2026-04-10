const fs = require('fs');
const file = 'soul-app-backend/src/routes/user.routes.ts';
let content = fs.readFileSync(file, 'utf8');

// 增加 /users/:id 获取他人资料
const profileRoutes = `
// ==================== 他人主页资料 (User Profile) ====================
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = require('../db').getDb();
    const targetId = parseInt(req.params.id, 10);
    const userUuid = req.user?.uuid || 'soul_123456';

    // 1. 查询本人 (Viewer)
    const viewer = await db.user.findUnique({ where: { uuid: userUuid } });
    if (!viewer) return sendError(res, 401, '当前登录已失效');

    // 2. 查询目标用户 (Target User)
    const targetUser = await db.user.findUnique({
      where: { id: targetId, status: 'active' },
      select: { id: true, uuid: true, name: true, avatar: true, bio: true, followersCount: true, followingCount: true }
    });

    if (!targetUser) return sendError(res, 404, '该星球居民不存在或已被封禁');

    // 3. 判断两人关注关系
    const followRecord = await db.userFollow.findUnique({
      where: { followerId_followingId: { followerId: viewer.id, followingId: targetId } }
    });
    const isFollowing = !!followRecord;

    // 4. 查询此人公开的瞬间动态前 20 条
    const rawMoments = await db.moment.findMany({
      where: { authorId: targetId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        tags: { select: { tagName: true } },
        likes: { where: { userId: viewer.id }, select: { userId: true } },
        _count: { select: { comments: true } }
      }
    });

    const momentsDto = rawMoments.map((m: any) => ({
      id: m.id,
      author: m.author,
      text: m.content,
      image: m.url,
      type: m.type,
      tags: m.tags.map((t: any) => t.tagName),
      time: m.createdAt.toISOString(),
      initialLikes: m.likesCount,
      isLiked: m.likes && m.likes.length > 0,
      comments: m._count.comments,
    }));

    const profileDto = {
      id: targetUser.uuid, // 兼容前端结构
      name: targetUser.name,
      avatar: targetUser.avatar,
      bio: targetUser.bio,
      followers: targetUser.followersCount,
      following: targetUser.followingCount
    };

    sendSuccess(res, { profile: profileDto, moments: momentsDto, isFollowing });

  } catch (err) {
    next(err);
  }
});
`;

// It might be conflicting with the router.post('/:id/follow') so let's append it carefully
if (!content.includes("router.get('/:id',")) {
  content += profileRoutes;
  fs.writeFileSync(file, content);
}
