import re

with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

massive_routes = """
// ==========================================
// MASSIVE API EXPANSION FOR SOCIAL APP
// ==========================================

// --- User Relationship System ---
router.post('/users/:id/follow', (req, res) => res.json({ success: true, message: 'Followed' }));
router.post('/users/:id/unfollow', (req, res) => res.json({ success: true, message: 'Unfollowed' }));
router.get('/users/:id/followers', (req, res) => res.json({ followers: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] }));
router.get('/users/:id/following', (req, res) => res.json({ following: [{ id: 4, name: 'User 4' }] }));
router.post('/users/:id/block', (req, res) => res.json({ success: true, message: 'User blocked' }));
router.post('/users/:id/unblock', (req, res) => res.json({ success: true, message: 'User unblocked' }));
router.get('/users/blocked', (req, res) => res.json({ blockedUsers: [] }));
router.post('/users/:id/report', (req, res) => res.json({ success: true, message: 'Report submitted successfully' }));
router.get('/users/:id/profile', (req, res) => res.json({ id: req.params.id, name: 'Mock User', bio: 'Hello world' }));

// --- Group Chat System ---
router.get('/groups', (req, res) => res.json({ groups: [{ id: 1, name: '深夜闲聊群', membersCount: 156 }] }));
router.post('/groups/create', (req, res) => res.json({ success: true, groupId: 2, message: 'Group created' }));
router.get('/groups/:id/members', (req, res) => res.json({ members: [{ id: 1, role: 'owner' }, { id: 2, role: 'member' }] }));
router.post('/groups/:id/join', (req, res) => res.json({ success: true, message: 'Joined group' }));
router.post('/groups/:id/leave', (req, res) => res.json({ success: true, message: 'Left group' }));
router.put('/groups/:id/settings', (req, res) => res.json({ success: true, message: 'Group settings updated' }));

// --- Audio / Voice Rooms ---
router.get('/voicerooms', (req, res) => res.json({ rooms: [{ id: 1, title: '一起听歌吧', listeners: 45 }] }));
router.post('/voicerooms/create', (req, res) => res.json({ success: true, roomId: 2, message: 'Voice room created' }));
router.post('/voicerooms/:id/join', (req, res) => res.json({ success: true, rtcToken: 'mock-rtc-token' }));
router.post('/voicerooms/:id/leave', (req, res) => res.json({ success: true }));
router.post('/voicerooms/:id/mic/request', (req, res) => res.json({ success: true, message: 'Mic request sent' }));

// --- Gifts & Wallet System ---
router.get('/wallet/balance', (req, res) => res.json({ coins: 1500, diamonds: 300 }));
router.post('/wallet/recharge', (req, res) => res.json({ success: true, newBalance: 2000 }));
router.get('/gifts', (req, res) => res.json({ gifts: [{ id: 1, name: '玫瑰', price: 10 }, { id: 2, name: '跑车', price: 1000 }] }));
router.post('/gifts/send', (req, res) => res.json({ success: true, message: 'Gift sent successfully' }));
router.get('/wallet/history', (req, res) => res.json({ transactions: [{ id: 1, type: 'recharge', amount: 500, date: '2023-10-01' }] }));

// --- Avatar Store (捏脸商城) ---
router.get('/store/items', (req, res) => res.json({ items: [{ id: 1, type: 'hair', name: '炫酷发型', price: 50 }] }));
router.post('/store/buy', (req, res) => res.json({ success: true, message: 'Item purchased' }));
router.get('/me/inventory', (req, res) => res.json({ inventory: [{ id: 1, type: 'hair', name: '炫酷发型' }] }));
router.put('/me/avatar', (req, res) => res.json({ success: true, message: 'Avatar saved' }));

// --- Search System ---
router.get('/search/users', (req, res) => res.json({ results: [{ id: 5, name: 'Search User' }] }));
router.get('/search/posts', (req, res) => res.json({ results: [{ id: 10, content: 'Search Post content' }] }));
router.get('/search/tags', (req, res) => res.json({ results: ['#日常', '#摄影', '#音乐'] }));

// --- Feed & Timeline ---
router.get('/feed/following', (req, res) => res.json({ posts: [] }));
router.get('/feed/recommend', (req, res) => res.json({ posts: [] }));
router.get('/feed/latest', (req, res) => res.json({ posts: [] }));
router.delete('/posts/:id', (req, res) => res.json({ success: true, message: 'Post deleted' }));
router.post('/posts/:id/share', (req, res) => res.json({ success: true, shareUrl: 'https://soul.app/p/123' }));

// --- Game Interactions ---
router.get('/games/list', (req, res) => res.json({ games: [{ id: 1, name: '狼人杀' }, { id: 2, name: '你画我猜' }] }));
router.post('/games/:id/match', (req, res) => res.json({ success: true, gameRoomId: 'room-123' }));

// --- Settings & Privacy ---
router.get('/settings/privacy', (req, res) => res.json({ showLocation: true, allowStrangerMessage: false }));
router.put('/settings/privacy', (req, res) => res.json({ success: true, message: 'Privacy settings updated' }));
router.get('/settings/blacklist', (req, res) => res.json({ blacklist: [] }));

"""

content = content.replace("export default router;", massive_routes + "\nexport default router;")

with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
