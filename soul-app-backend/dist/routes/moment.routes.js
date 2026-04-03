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
const router = (0, express_1.Router)();
// --- Real DB Implementation ---
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, type, url } = req.body;
        const db = (0, db_1.getDb)();
        const userResult = yield db.query(`SELECT id FROM users WHERE uuid = $1`, ['soul_123456']);
        if (userResult.rowCount === 0)
            return (0, response_1.sendError)(res, 404, 'User not found');
        const insertResult = yield db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userResult.rows[0].id, type || 'text', content || '', url || null]);
        res.json({ success: true, moment: insertResult.rows[0] });
    }
    catch (error) {
        next(error);
    }
}));
// --- Mock Implementations ---
router.post('/:id/like', (req, res) => res.json({ success: true, message: `Liked post ${req.params.id}`, newLikesCount: Math.floor(Math.random() * 100) }));
router.get('/:id/comments', (req, res) => res.json({ comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] }));
router.post('/:id/comments', (req, res) => res.json({ success: true, comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } }));
router.delete('/:id', (req, res) => res.json({ success: true, message: 'Post deleted' }));
router.post('/:id/share', (req, res) => res.json({ success: true, shareUrl: 'https://soul.app/p/123' }));
exports.default = router;
