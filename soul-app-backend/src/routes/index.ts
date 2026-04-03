import { Router } from 'express';
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
    try {
        await db.query('SELECT 1');
    } catch(e) {
        return res.json({ profile: { name: '一只小透明(Mock Mode)' }, moments: [] });
    }
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
