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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const moment_routes_1 = __importDefault(require("./moment.routes"));
const content_routes_1 = __importDefault(require("./content.routes"));
const social_routes_1 = __importDefault(require("./social.routes"));
const system_routes_1 = __importDefault(require("./system.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
// We keep /me top level to maintain compatibility with current frontend fetch calls
router.use('/me', (req, res, next) => {
    // A trick to map GET /api/me to user profile endpoint
    if (req.method === 'GET' && req.path === '/') {
        // Let it fall through, handled below explicitly
        next();
    }
    else {
        next();
    }
});
// explicit bindings for frontend compatibility
const db_1 = require("../db");
router.get('/me', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getDb)();
        try {
            yield db.query('SELECT 1');
        }
        catch (e) {
            return res.json({ profile: { name: '一只小透明(Mock Mode)' }, moments: [] });
        }
        const userResult = yield db.query(`SELECT * FROM users WHERE uuid = $1`, ['soul_123456']);
        if (userResult.rowCount === 0)
            return res.status(404).json({ error: 'User not found' });
        const user = userResult.rows[0];
        const momentsResult = yield db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);
        res.json({
            profile: { name: user.name, id: user.uuid, avatar: user.avatar, followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio },
            moments: momentsResult.rows
        });
    }
    catch (error) {
        next(error);
    }
}));
router.use('/users', user_routes_1.default);
router.use('/moments', moment_routes_1.default);
router.use('/', content_routes_1.default); // /planet, /explore, /feed
router.use('/', social_routes_1.default); // /chat, /match, /notifications
router.use('/', system_routes_1.default);
exports.default = router;
