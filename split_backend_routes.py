import os

routes_dir = 'soul-app-backend/src/routes/'

# 1. User routes -> move /me to /users/me
with open(routes_dir + 'user.routes.ts', 'r') as f:
    user_content = f.read()

user_content = user_content.replace("router.get('/me'", "router.get('/me'") # Keep as is in the file, it will be mapped at /users/me in index.ts
user_content = user_content.replace("router.put('/me/profile'", "router.put('/me/profile'")

with open(routes_dir + 'user.routes.ts', 'w') as f:
    f.write(user_content)

# 2. Mock Routes collection
with open(routes_dir + 'mock.routes.ts', 'w') as f:
    f.write("""import { Router } from 'express';
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
""")

# 3. Clean Index.ts
with open(routes_dir + 'index.ts', 'w') as f:
    f.write("""import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import momentRoutes from './moment.routes';
import contentRoutes from './content.routes';
import socialRoutes from './social.routes';
import mockRoutes from './mock.routes';

const router = Router();

// Core Domain Routing
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/moments', momentRoutes);

// Other domains
router.use('/', contentRoutes); // /planet, /explore, /feed
router.use('/', socialRoutes); // /chat, /match, /notifications

// Feature Flag: MOCK_ROUTES_ENABLED
if (process.env.MOCK_ROUTES_ENABLED === 'true') {
  console.log('Mock routes are enabled.');
  router.use('/mock', mockRoutes);
}

export default router;
""")

# 4. Remove system.routes since we moved it to mock
if os.path.exists(routes_dir + 'system.routes.ts'):
    os.remove(routes_dir + 'system.routes.ts')
