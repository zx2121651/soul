import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const db = getDb();
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const momentsCount = await db.query('SELECT COUNT(*) FROM moments');
    const roomsCount = await db.query('SELECT COUNT(*) FROM voice_rooms');

    sendSuccess(res, {
      totalUsers: parseInt(usersCount.rows[0].count),
      totalMoments: parseInt(momentsCount.rows[0].count),
      activeRooms: parseInt(roomsCount.rows[0].count),
      activeToday: 1128 // mock active today for now
    });
  } catch (err) {
    sendError(res, ErrorCode.SYSTEM_ERROR, 'Failed to fetch stats');
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
    sendError(res, ErrorCode.SYSTEM_ERROR, 'Failed to fetch users');
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
    sendError(res, ErrorCode.SYSTEM_ERROR, 'Failed to fetch moments');
  }
});

export default router;
