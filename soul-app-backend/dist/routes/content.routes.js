"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// --- Planet Mock Data ---
router.get('/planet', (req, res) => {
    const nodes = [];
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];
    for (let i = 0; i < 20; i++) {
        nodes.push({ id: i + 1, name: names[i % names.length] + (i > names.length ? i.toString() : ''), match: Math.floor(60 + Math.random() * 40) });
    }
    (0, response_1.sendSuccess)(res, { nodes });
});
// --- Explore Mock Data ---
router.get('/explore', (req, res) => {
    (0, response_1.sendSuccess)(res, {
        banners: [{ id: 1, title: '灵魂音乐节', bg: 'from-purple-500 to-indigo-500', emoji: '🎵' }, { id: 2, title: '深夜电台', bg: 'from-blue-500 to-cyan-500', emoji: '📻' }],
        trendingTopics: [{ id: 1, name: '寻找有趣的灵魂', icon: '✨' }, { id: 2, name: '深夜碎碎念', icon: '🌙' }],
        posts: [{ id: 1, user: { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice&backgroundColor=b6e3f4' }, content: '今天天气真好，适合出去走走。', type: 'text', tags: ['日常'], likes: 12 }]
    });
});
// --- Feed Mock ---
router.get('/feed/following', (req, res) => (0, response_1.sendSuccess)(res, { posts: [] }));
router.get('/feed/recommend', (req, res) => (0, response_1.sendSuccess)(res, { posts: [] }));
router.get('/feed/latest', (req, res) => (0, response_1.sendSuccess)(res, { posts: [] }));
exports.default = router;
