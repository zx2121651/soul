import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';

const router = Router();

// ==================== 仪表盘 (Dashboard) ====================
// 获取后台仪表盘统计数据和图表数据
router.get('/stats', async (req, res) => {
  try {
    const db = getDb();

    // Prisma 聚合查询
    const [totalUsers, totalMoments, activeRooms] = await Promise.all([
      db.user.count(),
      db.moment.count(),
      db.voiceRoom.count({ where: { status: 'active' } })
    ]);

    sendSuccess(res, {
      totalUsers,
      totalMoments,
      activeRooms,
      activeToday: 1128, // mock active today for now

      // 饼图用的数据 (性别分布)
      genderData: [
        { name: '男生', value: 45 },
        { name: '女生', value: 55 }
      ],
      // 饼图用的数据 (瞬间动态类型分布)
      momentTypeData: [
        { name: '纯文字', value: 35 },
        { name: '图文', value: 50 },
        { name: '语音', value: 15 }
      ],
      // 添加图表用的趋势数据 (模拟最近7天)
      chartData: [
        { date: '10-01', users: 120, moments: 45, rooms: 5 },
        { date: '10-02', users: 132, moments: 50, rooms: 6 },
        { date: '10-03', users: 145, moments: 58, rooms: 8 },
        { date: '10-04', users: 150, moments: 40, rooms: 5 },
        { date: '10-05', users: 162, moments: 65, rooms: 10 },
        { date: '10-06', users: 180, moments: 80, rooms: 12 },
        { date: '10-07', users: 210, moments: 95, rooms: 15 }
      ]
    });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch stats');
  }
});

// ==================== 星球居民管理 (Users) ====================
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = (req.query.status as string) || 'active'; // 默认查询正常用户

    const [total, users] = await Promise.all([
      db.user.count({ where: { status } }),
      db.user.findMany({
        where: { status },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: { id: true, uuid: true, name: true, phone: true, avatar: true, bio: true, status: true, createdAt: true }
      })
    ]);

    sendSuccess(res, { items: users, total });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch users');
  }
});

// 逻辑封禁星球居民 (软删除)
router.delete('/users/:id', async (req, res) => {
  try {
    const db = getDb();
    const userId = parseInt(req.params.id, 10);
    await db.user.update({ where: { id: userId }, data: { status: 'banned' } });
    sendSuccess(res, null, '该星球居民已被成功封禁(删除)');
  } catch (err) {
    sendError(res, 500, '封禁居民失败');
  }
});

// 恢复(解封)星球居民
router.post('/users/:id/restore', async (req, res) => {
  try {
    const db = getDb();
    const userId = parseInt(req.params.id, 10);
    await db.user.update({ where: { id: userId }, data: { status: 'active' } });
    sendSuccess(res, null, '该星球居民已成功解封');
  } catch (err) {
    sendError(res, 500, '解封居民失败');
  }
});

// ==================== 瞬间动态管理 (Moments) ====================
router.get('/moments', async (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = (req.query.status as string) || 'active'; // 默认查询在架动态
    const userIdStr = req.query.userId as string;
    const userId = userIdStr ? parseInt(userIdStr, 10) : undefined;

    const whereCondition: any = { status };
    if (userId) whereCondition.authorId = userId;

    const [total, moments] = await Promise.all([
      db.moment.count({ where: whereCondition }),
      db.moment.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, avatar: true } } }
      })
    ]);

    const formattedMoments = moments.map(m => ({
      id: m.id, content: m.content, type: m.type, media_urls: m.url, likes: m.likesCount, status: m.status, created_at: m.createdAt,
      author_name: m.author.name, author_avatar: m.author.avatar
    }));

    sendSuccess(res, { items: formattedMoments, total });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch moments');
  }
});

// 逻辑下架瞬间动态 (软删除)
router.delete('/moments/:id', async (req, res) => {
  try {
    const db = getDb();
    const momentId = parseInt(req.params.id, 10);
    await db.moment.update({ where: { id: momentId }, data: { status: 'deleted' } });
    sendSuccess(res, null, '瞬间动态已强制下架');
  } catch (err) {
    sendError(res, 500, '下架瞬间动态失败');
  }
});

// 恢复上架瞬间动态
router.post('/moments/:id/restore', async (req, res) => {
  try {
    const db = getDb();
    const momentId = parseInt(req.params.id, 10);
    await db.moment.update({ where: { id: momentId }, data: { status: 'active' } });
    sendSuccess(res, null, '瞬间动态已恢复上架');
  } catch (err) {
    sendError(res, 500, '恢复瞬间动态失败');
  }
});

// ==================== BANNERS (轮播海报) ====================
// 获取轮播海报列表
router.get('/banners', async (req, res) => {
  try {
    const db = getDb();
    const [total, banners] = await Promise.all([
      db.banner.count({ where: { status: 'active' } }),
      db.banner.findMany({ where: { status: 'active' }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
    ]);
    sendSuccess(res, { items: banners, total });
  } catch (err) {
    sendError(res, 500, '获取轮播海报失败');
  }
});

// 新增轮播海报
router.post('/banners', async (req, res) => {
  try {
    const db = getDb();
    const { image_url, link = '#', sort_order = 0 } = req.body;
    if (!image_url) return sendError(res, 400, '海报图片链接不能为空');
    const newBanner = await db.banner.create({ data: { imageUrl: image_url, link, sortOrder: sort_order, status: 'active' } });
    sendSuccess(res, newBanner, '海报配置成功');
  } catch (err) {
    sendError(res, 500, '新增轮播海报失败');
  }
});

// 下架(删除)轮播海报
router.delete('/banners/:id', async (req, res) => {
  try {
    const db = getDb();
    const bannerId = parseInt(req.params.id, 10);
    await db.banner.update({ where: { id: bannerId }, data: { status: 'deleted' } });
    sendSuccess(res, null, '海报已下架');
  } catch (err) {
    sendError(res, 500, '海报下架失败');
  }
});

// ==================== 语音房管理 (VoiceRooms) ====================
// 获取语音房列表
router.get('/voice-rooms', async (req, res) => {
  try {
    const db = getDb();
    const [total, rooms] = await Promise.all([
      db.voiceRoom.count(),
      db.voiceRoom.findMany({ include: { host: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
    ]);
    const formattedRooms = rooms.map(r => ({
      id: r.id, name: r.name, online_count: r.onlineCount, status: r.status, created_at: r.createdAt, host_name: r.host.name
    }));
    sendSuccess(res, { items: formattedRooms, total });
  } catch (err) {
    sendError(res, 500, '获取语音房列表失败');
  }
});

// 删除(下架)语音房
router.delete('/voice-rooms/:id', async (req, res) => {
  try {
    const db = getDb();
    const roomId = parseInt(req.params.id, 10);
    await db.voiceRoom.delete({ where: { id: roomId } });
    sendSuccess(res, null, '语音房已成功下架');
  } catch (err) {
    sendError(res, 500, '删除语音房失败');
  }
});

// 管理员监听进入语音房
router.post('/voice-rooms/:id/monitor', async (req, res) => {
  try {
    const db = getDb();
    const roomId = req.params.id; // 'room_1', etc or ID

    const { generateToken } = require('../utils/livekit');
    const token = generateToken(roomId, 'Admin_Monitor', true);

    sendSuccess(res, {
      token,
      serverUrl: process.env.LIVEKIT_WS_URL || 'wss://soul-app-livekit-mock.com',
      isOwner: true
    });
  } catch (err) {
    sendError(res, 500, '监听接入失败');
  }
});

// ==================== 系统广播 (Announcements) ====================
// 获取系统广播(通知)列表
router.get('/announcements', async (req, res) => {
  try {
    const db = getDb();
    const [total, announcements] = await Promise.all([
      db.announcement.count(),
      db.announcement.findMany({ orderBy: { createdAt: 'desc' } })
    ]);
    const formattedAnns = announcements.map(a => ({
      id: a.id, title: a.title, content: a.content, type: a.type, created_at: a.createdAt
    }));
    sendSuccess(res, { items: formattedAnns, total });
  } catch (err) {
    sendError(res, 500, '获取系统广播列表失败');
  }
});

// 发布新的系统广播
router.post('/announcements', async (req, res) => {
  try {
    const db = getDb();
    const { title, content, type = 'info' } = req.body;
    if (!title || !content) return sendError(res, 400, '标题和内容不能为空');
    const newAnn = await db.announcement.create({ data: { title, content, type } });
    sendSuccess(res, newAnn, '系统广播发布成功');
  } catch (err) {
    sendError(res, 500, '系统广播发布失败');
  }
});

export default router;
