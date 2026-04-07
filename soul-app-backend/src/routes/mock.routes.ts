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

// User Relationship Mocks
// --- User Relationship (Mock Implementation) ---
router.post('/:id/follow', (req, res) => sendSuccess(res, null, 'Followed'));
router.post('/:id/unfollow', (req, res) => sendSuccess(res, null, 'Unfollowed'));
router.get('/:id/followers', (req, res) => sendSuccess(res, { followers: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] }));
router.get('/:id/following', (req, res) => sendSuccess(res, { following: [{ id: 4, name: 'User 4' }] }));
router.post('/:id/block', (req, res) => sendSuccess(res, null, 'User blocked'));
router.post('/:id/unblock', (req, res) => sendSuccess(res, null, 'User unblocked'));
router.get('/blocked', (req, res) => sendSuccess(res, { blockedUsers: [] }));
router.post('/:id/report', (req, res) => sendSuccess(res, null, 'Report submitted successfully'));
router.get('/:id/profile', (req, res) => sendSuccess(res, { id: req.params.id, name: 'Mock User', bio: 'Hello world' }));


// Moment Interactions Mocks
// --- Mock Implementations ---
router.post('/:id/like', (req, res) => sendSuccess(res, { newLikesCount: Math.floor(Math.random() * 100) }, `Liked post ${req.params.id}`));
router.get('/:id/comments', (req, res) => sendSuccess(res, { comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] }));
router.post('/:id/comments', (req, res) => sendSuccess(res, { comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } }));
router.delete('/:id', (req, res) => sendSuccess(res, null, 'Post deleted'));
router.post('/:id/share', (req, res) => sendSuccess(res, { shareUrl: 'https://soul.app/p/123' }));


export default router;
