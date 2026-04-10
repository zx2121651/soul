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

// ==================== 他人主页资料 (User Profile) ====================
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = require('../db').getDb();
    const targetId = parseInt(req.params.id as string, 10);
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
