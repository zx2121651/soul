"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// Store, VIP, Games, Ads, Admin (Pure Mock features without DB backend)
router.get('/store/items', (req, res) => (0, response_1.sendSuccess)(res, { items: [{ id: 1, type: 'hair', name: '炫酷发型', price: 50 }] }));
router.get('/vip/status', (req, res) => (0, response_1.sendSuccess)(res, { isVip: true, expireAt: '2024-12-31', level: 3 }));
router.get('/admin/reports', (req, res) => (0, response_1.sendSuccess)(res, { reports: [{ id: 1, targetId: 2, reason: 'spam' }] }));
// Fallback legacy massive routes
router.get('/voicerooms', (req, res) => (0, response_1.sendSuccess)(res, { rooms: [{ id: 1, title: '一起听歌吧', listeners: 45 }] }));
router.get('/groups', (req, res) => (0, response_1.sendSuccess)(res, { groups: [{ id: 1, name: '深夜闲聊群', membersCount: 156 }] }));
router.post('/groups/create', (req, res) => (0, response_1.sendSuccess)(res, { groupId: 2 }, 'Group created'));
exports.default = router;
