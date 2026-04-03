import os

routes_dir = 'soul-app-backend/src/routes/'

# --- Auth Routes ---
with open(routes_dir + 'auth.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';
import { sendSuccess } from '../utils/response';
import jwt from 'jsonwebtoken';

const router = Router();

// --- Auth Data (Mock Implementation) ---
router.post('/login', (req, res) => {
  const token = jwt.sign({ id: 1, uuid: 'soul_123456', role: 'user' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  sendSuccess(res, { token, user: { id: 1, name: '一只小透明' } }, '登录成功');
});

router.post('/register', (req, res) => {
  sendSuccess(res, null, '注册成功');
});

export default router;
""")

# --- User Routes ---
with open(routes_dir + 'user.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';
import { getDb } from '../db';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// --- Real DB Implementation ---
router.get('/me', async (req, res, next) => {
  try {
    const db = getDb();
    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const user = userResult.rows[0];
    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);

    // For backward compatibility with frontend, return flat structure for now or mapped
    // We keep the old structure but wrap it in the new response formatter if needed.
    // Notice: to not break existing frontend, we might just send raw json, but let's standardise if possible.
    // The frontend currently expects: data.profile, data.moments
    res.json({
      profile: {
        name: user.name, id: user.uuid, avatar: user.avatar,
        followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio
      },
      moments: momentsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

router.put('/me/profile', (req, res) => res.json({ success: true, message: '个人资料已更新', updatedData: req.body }));

// --- User Relationship (Mock Implementation) ---
router.post('/:id/follow', (req, res) => res.json({ success: true, message: 'Followed' }));
router.post('/:id/unfollow', (req, res) => res.json({ success: true, message: 'Unfollowed' }));
router.get('/:id/followers', (req, res) => res.json({ followers: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] }));
router.get('/:id/following', (req, res) => res.json({ following: [{ id: 4, name: 'User 4' }] }));
router.post('/:id/block', (req, res) => res.json({ success: true, message: 'User blocked' }));
router.post('/:id/unblock', (req, res) => res.json({ success: true, message: 'User unblocked' }));
router.get('/blocked', (req, res) => res.json({ blockedUsers: [] }));
router.post('/:id/report', (req, res) => res.json({ success: true, message: 'Report submitted successfully' }));
router.get('/:id/profile', (req, res) => res.json({ id: req.params.id, name: 'Mock User', bio: 'Hello world' }));

export default router;
""")


# --- Moment / Post Routes ---
with open(routes_dir + 'moment.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';
import { getDb } from '../db';
import { sendError } from '../utils/response';

const router = Router();

// --- Real DB Implementation ---
router.post('/', async (req, res, next) => {
  try {
    const { content, type, url } = req.body;
    const db = getDb();

    const userResult = await db.query(`SELECT id FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const insertResult = await db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userResult.rows[0].id, type || 'text', content || '', url || null]);

    res.json({ success: true, moment: insertResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// --- Mock Implementations ---
router.post('/:id/like', (req, res) => res.json({ success: true, message: `Liked post ${req.params.id}`, newLikesCount: Math.floor(Math.random() * 100) }));
router.get('/:id/comments', (req, res) => res.json({ comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] }));
router.post('/:id/comments', (req, res) => res.json({ success: true, comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } }));
router.delete('/:id', (req, res) => res.json({ success: true, message: 'Post deleted' }));
router.post('/:id/share', (req, res) => res.json({ success: true, shareUrl: 'https://soul.app/p/123' }));

export default router;
""")

# --- View / Page Content Routes (Explore/Planet/Feed) ---
with open(routes_dir + 'content.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';

const router = Router();

// --- Planet Mock Data ---
router.get('/planet', (req, res) => {
  const nodes = [];
  const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];
  for (let i = 0; i < 20; i++) {
      nodes.push({ id: i + 1, name: names[i % names.length] + (i > names.length ? i.toString() : ''), match: Math.floor(60 + Math.random() * 40) });
  }
  res.json({ nodes });
});

// --- Explore Mock Data ---
router.get('/explore', (req, res) => {
  res.json({
    banners: [ { id: 1, title: '灵魂音乐节', bg: 'from-purple-500 to-indigo-500', emoji: '🎵' }, { id: 2, title: '深夜电台', bg: 'from-blue-500 to-cyan-500', emoji: '📻' } ],
    trendingTopics: [ { id: 1, name: '寻找有趣的灵魂', icon: '✨' }, { id: 2, name: '深夜碎碎念', icon: '🌙' } ],
    posts: [ { id: 1, user: { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice&backgroundColor=b6e3f4' }, content: '今天天气真好，适合出去走走。', type: 'text', tags: ['日常'], likes: 12 } ]
  });
});

// --- Feed Mock ---
router.get('/feed/following', (req, res) => res.json({ posts: [] }));
router.get('/feed/recommend', (req, res) => res.json({ posts: [] }));
router.get('/feed/latest', (req, res) => res.json({ posts: [] }));

export default router;
""")

# --- Social & Chat Routes ---
with open(routes_dir + 'social.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';

const router = Router();

router.get('/chat', (req, res) => {
  res.json({
    chats: [ { id: 1, name: "Soul官方助手", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede", lastMessage: "你的星球有了新的访客，快去看看吧！", time: "10:30", unread: 2, isOfficial: true } ],
    pinnedUsers: [ { id: 101, name: '夏天🌿', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede', isOnline: true } ]
  });
});

router.get('/chat/:roomId/messages', (req, res) => res.json({ roomId: req.params.roomId, messages: [{ id: 1, senderId: 2, text: '你好呀！', time: '10:00' }] }));
router.post('/chat/:roomId/messages', (req, res) => res.json({ success: true, message: { id: Date.now(), senderId: 1, text: req.body.text, time: '刚刚', isSelf: true } }));

router.post('/match', (req, res) => {
  setTimeout(() => {
    res.json({ success: true, matchUser: { id: 999, name: '未知的灵魂', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=unknown&backgroundColor=d1c4e9', matchPercentage: 98, tags: ['摄影', '独立音乐'] } });
  }, 1000);
});

router.get('/notifications', (req, res) => res.json({ notifications: [ { id: 1, type: 'like', text: '夏天🌿 赞了你的瞬间', time: '1小时前', isRead: false } ] }));

export default router;
""")

# --- System & Other Legacy Routes ---
with open(routes_dir + 'system.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';

const router = Router();

// Groups
router.get('/groups', (req, res) => res.json({ groups: [{ id: 1, name: '深夜闲聊群', membersCount: 156 }] }));
router.post('/groups/create', (req, res) => res.json({ success: true, groupId: 2, message: 'Group created' }));

// Voice rooms
router.get('/voicerooms', (req, res) => res.json({ rooms: [{ id: 1, title: '一起听歌吧', listeners: 45 }] }));

// Wallet & Store
router.get('/wallet/balance', (req, res) => res.json({ coins: 1500, diamonds: 300 }));
router.get('/store/items', (req, res) => res.json({ items: [{ id: 1, type: 'hair', name: '炫酷发型', price: 50 }] }));

// Admin & VIP
router.get('/vip/status', (req, res) => res.json({ isVip: true, expireAt: '2024-12-31', level: 3 }));
router.get('/admin/reports', (req, res) => res.json({ reports: [{ id: 1, targetId: 2, reason: 'spam' }] }));

// Fallback legacy massive routes can be grouped here...
export default router;
""")

# --- Index Route Aggregator ---
with open(routes_dir + 'index.ts', 'w') as f:
    f.write("""import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import momentRoutes from './moment.routes';
import contentRoutes from './content.routes';
import socialRoutes from './social.routes';
import systemRoutes from './system.routes';

const router = Router();

router.use('/auth', authRoutes);

// We keep /me top level to maintain compatibility with current frontend fetch calls
router.use('/me', (req, res, next) => {
    // A trick to map GET /api/me to user profile endpoint
    if(req.method === 'GET' && req.path === '/') {
        // Let it fall through, handled below explicitly
        next();
    } else {
        next();
    }
});

// explicit bindings for frontend compatibility
import { getDb } from '../db';
router.get('/me', async (req, res, next) => {
  try {
    const db = getDb();
    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, ['soul_123456']);
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];
    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);
    res.json({
      profile: { name: user.name, id: user.uuid, avatar: user.avatar, followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio },
      moments: momentsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

router.use('/users', userRoutes);
router.use('/moments', momentRoutes);
router.use('/', contentRoutes); // /planet, /explore, /feed
router.use('/', socialRoutes); // /chat, /match, /notifications
router.use('/', systemRoutes);

export default router;
""")
