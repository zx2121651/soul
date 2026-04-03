"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// --- Planet Data ---
router.get('/planet', (req, res) => {
    // Generate some random node data for the planet view
    const nodes = [];
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];
    for (let i = 0; i < 20; i++) {
        nodes.push({
            id: i + 1,
            name: names[i % names.length] + (i > names.length ? i.toString() : ''),
            match: Math.floor(60 + Math.random() * 40)
        });
    }
    res.json({
        nodes
    });
});
// --- Explore Data ---
router.get('/explore', (req, res) => {
    res.json({
        banners: [
            { id: 1, title: '灵魂音乐节', bg: 'from-purple-500 to-indigo-500', emoji: '🎵' },
            { id: 2, title: '深夜电台', bg: 'from-blue-500 to-cyan-500', emoji: '📻' }
        ],
        trendingTopics: [
            { id: 1, name: '寻找有趣的灵魂', icon: '✨' },
            { id: 2, name: '深夜碎碎念', icon: '🌙' }
        ],
        posts: [
            {
                id: 1,
                user: { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice&backgroundColor=b6e3f4' },
                content: '今天天气真好，适合出去走走。',
                type: 'text',
                tags: ['日常'],
                likes: 12
            }
        ]
    });
});
// --- Chat Data ---
router.get('/chat', (req, res) => {
    res.json({
        chats: [
            {
                id: 1,
                name: "Soul官方助手",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede",
                lastMessage: "你的星球有了新的访客，快去看看吧！",
                time: "10:30",
                unread: 2,
                isOfficial: true
            }
        ],
        pinnedUsers: [
            { id: 101, name: '夏天🌿', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede', isOnline: true }
        ]
    });
});
// --- Me Data ---
router.get('/me', (req, res) => {
    res.json({
        profile: {
            name: '一只小透明',
            id: 'soul_123456',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2',
            followers: 128,
            following: 56,
            visitors: 342,
            bio: '寻找宇宙中的同频共振'
        },
        moments: globalMoments
    });
});
// --- State for Moments ---
let globalMoments = [
    {
        id: 1,
        type: 'text',
        content: '保持热爱，奔赴山海'
    }
];
// --- Moment Post logic ---
router.post('/moments', (req, res) => {
    const { content, type, url } = req.body;
    const newMoment = {
        id: globalMoments.length + 1,
        type: type || 'text',
        content: content || '',
        url: url
    };
    globalMoments.unshift(newMoment);
    res.json({ success: true, moment: newMoment });
});
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
exports.default = router;
