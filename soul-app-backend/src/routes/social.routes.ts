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

router.get('/chat/:roomId/messages', (req, res) => sendSuccess(res, { roomId: req.params.roomId, messages: [{ id: 1, senderId: 2, text: '你好呀！', time: '10:00' }] }));
router.post('/chat/:roomId/messages', (req, res) => sendSuccess(res, { success: true, message: { id: Date.now(), senderId: 1, text: req.body.text, time: '刚刚', isSelf: true } }));

router.post('/match', (req, res) => {
  setTimeout(() => {
    sendSuccess(res, { success: true, matchUser: { id: 999, name: '未知的灵魂', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=unknown&backgroundColor=d1c4e9', matchPercentage: 98, tags: ['摄影', '独立音乐'] } });
  }, 1000);
});

router.get('/notifications', (req, res) => sendSuccess(res, { notifications: [ { id: 1, type: 'like', text: '夏天🌿 赞了你的瞬间', time: '1小时前', isRead: false } ] }));

export default router;
