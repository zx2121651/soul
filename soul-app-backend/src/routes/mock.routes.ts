import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

// Store, VIP, Games, Ads, Admin (Pure Mock features without DB backend)
router.get('/store/items', (req, res) => sendSuccess(res, { items: [{ id: 1, type: 'hair', name: '炫酷发型', price: 50 }] }));
router.get('/vip/status', (req, res) => sendSuccess(res, { isVip: true, expireAt: '2024-12-31', level: 3 }));
router.get('/admin/reports', (req, res) => sendSuccess(res, { reports: [{ id: 1, targetId: 2, reason: 'spam' }] }));

// Fallback legacy massive routes
router.get('/voicerooms', (req, res) => sendSuccess(res, { rooms: [{ id: 1, title: '一起听歌吧', listeners: 45 }] }));
router.get('/groups', (req, res) => sendSuccess(res, { groups: [{ id: 1, name: '深夜闲聊群', membersCount: 156 }] }));
router.post('/groups/create', (req, res) => sendSuccess(res, { groupId: 2 }, 'Group created'));

export default router;
