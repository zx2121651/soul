"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// --- Planet Data ---
router.get('/planet', (req, res) => {
    res.json({
        nodes: [
            { id: 1, name: 'Alice', match: 95 },
            { id: 2, name: 'Bob', match: 80 },
        ]
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
        moments: [
            {
                id: 1,
                type: 'text',
                content: '保持热爱，奔赴山海'
            }
        ]
    });
});
exports.default = router;
