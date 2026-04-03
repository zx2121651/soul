import re

with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

new_routes = """
// --- Auth Data (Mock) ---
router.post('/auth/login', (req, res) => {
  res.json({ success: true, token: 'mock-jwt-token-123', user: { id: 1, name: '一只小透明' } });
});

router.post('/auth/register', (req, res) => {
  res.json({ success: true, message: '注册成功' });
});

// --- Posts Interactions ---
router.post('/posts/:id/like', (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: `Liked post ${id}`, newLikesCount: Math.floor(Math.random() * 100) });
});

router.get('/posts/:id/comments', (req, res) => {
  res.json({
    comments: [
      { id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' },
      { id: 2, user: '星空✨', content: '+1，深有同感', time: '半小时前' }
    ]
  });
});

router.post('/posts/:id/comments', (req, res) => {
  const { content } = req.body;
  res.json({ success: true, comment: { id: Date.now(), user: '自己 (Me)', content, time: '刚刚' } });
});

// --- Chat Room Messages ---
router.get('/chat/:roomId/messages', (req, res) => {
  res.json({
    roomId: req.params.roomId,
    messages: [
      { id: 1, senderId: 2, text: '你好呀！', time: '10:00' },
      { id: 2, senderId: 1, text: '嗨，很高兴认识你', time: '10:05', isSelf: true }
    ]
  });
});

router.post('/chat/:roomId/messages', (req, res) => {
  const { text } = req.body;
  res.json({ success: true, message: { id: Date.now(), senderId: 1, text, time: '刚刚', isSelf: true } });
});

// --- Matching System ---
router.post('/match', (req, res) => {
  // Simulate finding a match
  setTimeout(() => {
    res.json({
      success: true,
      matchUser: {
        id: 999,
        name: '未知的灵魂',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=unknown&backgroundColor=d1c4e9',
        matchPercentage: 98,
        tags: ['摄影', '独立音乐']
      }
    });
  }, 1000); // simulate delay
});

// --- Notifications ---
router.get('/notifications', (req, res) => {
  res.json({
    notifications: [
      { id: 1, type: 'like', text: '夏天🌿 赞了你的瞬间', time: '1小时前', isRead: false },
      { id: 2, type: 'visit', text: '有3个新访客访问了你的主页', time: '3小时前', isRead: true }
    ]
  });
});

// --- Profile Management ---
router.put('/me/profile', (req, res) => {
  const { name, bio } = req.body;
  res.json({ success: true, message: '个人资料已更新', updatedData: { name, bio } });
});

"""

content = content.replace("export default router;", new_routes + "\nexport default router;")

with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
