import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';

import { authMiddleware } from '../middlewares/auth.middleware';
import { ChatService } from '../services/chat.service';
import { ErrorCode } from '../utils/ErrorCodes';
const chatService = new ChatService();

const router = Router();

router.get('/chat', authMiddleware, async (req, res, next) => {
  try {
    const userUuid = req.user?.uuid || 'soul_123456';
    const chats = await chatService.getChatList(userUuid);
    sendSuccess(res, { chats, pinnedUsers: [] });
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, error.message, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

router.get('/chat/:roomId/messages', authMiddleware, async (req, res, next) => {
  try {
    const userUuid = req.user?.uuid || 'soul_123456';
    const roomId = parseInt(req.params.roomId as string, 10);
    const messages = await chatService.getMessages(roomId, userUuid);
    sendSuccess(res, { roomId, messages });
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, error.message, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});
router.post('/chat/:roomId/messages', authMiddleware, async (req, res, next) => {
  try {
    const userUuid = req.user?.uuid || 'soul_123456';
    const roomId = parseInt(req.params.roomId as string, 10);
    const text = req.body.text;
    const message = await chatService.sendMessage(roomId, userUuid, text);
    sendSuccess(res, { success: true, message });
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, error.message, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

// 真实的星球匹配逻辑，寻找随机用户进行匹配
router.post('/match', authMiddleware, async (req, res, next) => {
  try {
    const userUuid = req.user?.uuid || 'soul_123456';
    const db = require('../db').getDb();

    // 从数据库中随机挑选一个不是自己且不是机器人的用户
    const result = await db.query(`
      SELECT id, name, avatar, bio
      FROM users
      WHERE uuid != $1 AND uuid != 'soul_bot_001'
      ORDER BY RANDOM()
      LIMIT 1
    `, [userUuid]);

    let matchUser;
    if (result.rows.length > 0) {
      const u = result.rows[0];
      matchUser = {
        id: u.id,
        name: u.name,
        avatar: u.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=unknown&backgroundColor=d1c4e9',
        matchPercentage: Math.floor(Math.random() * 20) + 80, // 80-99% 匹配度
        tags: ['有趣', '探索者'],
        bio: u.bio
      };
    } else {
      // 兜底假数据
      matchUser = {
        id: 999,
        name: '未知的灵魂',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=unknown&backgroundColor=d1c4e9',
        matchPercentage: 98,
        tags: ['摄影', '独立音乐']
      };
    }

    // 延迟 1.5 秒模拟雷达搜索效果
    setTimeout(() => {
      sendSuccess(res, { success: true, matchUser });
    }, 1500);

  } catch (error) {
    next(error);
  }
});

router.get('/notifications', (req, res) => sendSuccess(res, { notifications: [ { id: 1, type: 'like', text: '夏天🌿 赞了你的瞬间', time: '1小时前', isRead: false } ] }));

export default router;
