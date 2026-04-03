"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// --- Auth Data (Mock Implementation) ---
router.post('/login', (req, res) => {
    const token = jsonwebtoken_1.default.sign({ id: 1, uuid: 'soul_123456', role: 'user' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    (0, response_1.sendSuccess)(res, { token, user: { id: 1, name: '一只小透明' } }, '登录成功');
});
router.post('/register', (req, res) => {
    (0, response_1.sendSuccess)(res, null, '注册成功');
});
exports.default = router;
