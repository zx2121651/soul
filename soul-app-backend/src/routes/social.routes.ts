import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/chat', (req, res) => {
  sendSuccess(res, {
    chats: [ { id: 1, name: "Soul官方助手", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede", lastMessage: "你的星球有了新的访客，快去看看吧！", time: "10:30", unread: 2, isOfficial: true } ],
    pinnedUsers: [ { id: 101, name: '夏天🌿', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede', isOnline: true } ]
  });
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
