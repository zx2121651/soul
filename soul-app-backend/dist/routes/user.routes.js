"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const response_1 = require("../utils/response");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// --- Real DB Implementation ---
router.get('/me', auth_middleware_1.authMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const db = (0, db_1.getDb)();
        // Auth context injected by middleware
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
        const userUuid = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.uuid) || 'soul_123456';
        const userResult = yield db.query(`SELECT * FROM users WHERE uuid = $1`, [userUuid]);
        if (userResult.rowCount === 0)
            return (0, response_1.sendError)(res, 404, 'User not found');
        const user = userResult.rows[0];
        const momentsResult = yield db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);
        (0, response_1.sendSuccess)(res, {
            profile: {
                name: user.name, id: user.uuid, avatar: user.avatar,
                followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio
            },
            moments: momentsResult.rows
        });
    }
    catch (error) {
        next(error);
    }
}));
router.put('/me/profile', auth_middleware_1.authMiddleware, (req, res) => (0, response_1.sendSuccess)(res, req.body, '个人资料已更新'));
// --- User Relationship (Mock Implementation) ---
router.post('/:id/follow', (req, res) => (0, response_1.sendSuccess)(res, null, 'Followed'));
router.post('/:id/unfollow', (req, res) => (0, response_1.sendSuccess)(res, null, 'Unfollowed'));
router.get('/:id/followers', (req, res) => (0, response_1.sendSuccess)(res, { followers: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] }));
router.get('/:id/following', (req, res) => (0, response_1.sendSuccess)(res, { following: [{ id: 4, name: 'User 4' }] }));
router.post('/:id/block', (req, res) => (0, response_1.sendSuccess)(res, null, 'User blocked'));
router.post('/:id/unblock', (req, res) => (0, response_1.sendSuccess)(res, null, 'User unblocked'));
router.get('/blocked', (req, res) => (0, response_1.sendSuccess)(res, { blockedUsers: [] }));
router.post('/:id/report', (req, res) => (0, response_1.sendSuccess)(res, null, 'Report submitted successfully'));
router.get('/:id/profile', (req, res) => (0, response_1.sendSuccess)(res, { id: req.params.id, name: 'Mock User', bio: 'Hello world' }));
exports.default = router;
