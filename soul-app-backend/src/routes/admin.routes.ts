import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';

const router = Router();

// 获取后台仪表盘统计数据和图表数据
router.get('/stats', async (req, res) => {
  try {
    const db = getDb();
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const momentsCount = await db.query('SELECT COUNT(*) FROM moments');
    const roomsCount = await db.query('SELECT COUNT(*) FROM voice_rooms');

    sendSuccess(res, {
      totalUsers: usersCount.rows[0].count || usersCount.rows[0]['COUNT(*)'] || 0,
      totalMoments: momentsCount.rows[0].count || momentsCount.rows[0]['COUNT(*)'] || 0,
      activeRooms: roomsCount.rows[0].count || roomsCount.rows[0]['COUNT(*)'] || 0,
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

router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const countRes = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countRes.rows[0].count);

    const usersRes = await db.query(`
      SELECT id, uuid, name, username, avatar, bio, gender, age, followers, following, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    sendSuccess(res, {
      items: usersRes.rows,
      total
    });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch users');
  }
});

router.get('/moments', async (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const countRes = await db.query('SELECT COUNT(*) FROM moments');
    const total = parseInt(countRes.rows[0].count);

    const momentsRes = await db.query(`
      SELECT m.id, m.uuid, m.content, m.type, m.media_urls, m.likes, m.comments, m.created_at,
             u.name as author_name, u.avatar as author_avatar
      FROM moments m
      JOIN users u ON m.author_id = u.id
      ORDER BY m.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    sendSuccess(res, {
      items: momentsRes.rows,
      total
    });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch moments');
  }
});

export default router;


// 获取语音房列表
router.get('/voice-rooms', async (req, res) => {
  try {
    const db = getDb();

    const countRes = await db.query('SELECT COUNT(*) FROM voice_rooms');
    const total = countRes.rows[0].count || countRes.rows[0]['COUNT(*)'] || 0;

    const roomsRes = await db.query(`
      SELECT r.id, r.name, r.online_count, r.status, r.created_at,
             u.name as host_name
      FROM voice_rooms r
      LEFT JOIN users u ON r.host_id = u.id
      ORDER BY r.created_at DESC
    `);

    sendSuccess(res, {
      items: roomsRes.rows,
      total
    });
  } catch (err) {
    sendError(res, 500, '获取语音房列表失败');
  }
});

// 删除(下架)语音房
router.delete('/voice-rooms/:id', async (req, res) => {
  try {
    const db = getDb();
    const roomId = parseInt(req.params.id, 10);

    // 这里使用硬删除，也可以改为 UPDATE status = 'closed'
    await db.query('DELETE FROM voice_rooms WHERE id = $1', [roomId]);

    sendSuccess(res, null, '语音房已成功下架');
  } catch (err) {
    sendError(res, 500, '删除语音房失败');
  }
});
