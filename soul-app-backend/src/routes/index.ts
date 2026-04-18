import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import momentRoutes from './moment.routes';
import contentRoutes from './content.routes';
import socialRoutes from './social.routes';
import mockRoutes from './mock.routes';
import voiceroomRoutes from './voiceroom.routes';
import adminRoutes from './admin.routes';
import debugRoutes from './debug.routes';

const router = Router();

// Core Domain Routing
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/moments', momentRoutes);
router.use('/voicerooms', voiceroomRoutes);

router.use('/admin', adminRoutes);
router.use('/debug', debugRoutes);

// Other domains
router.use('/', contentRoutes); // /planet, /explore, /feed
router.use('/', socialRoutes); // /chat, /match, /notifications

// Feature Flag: MOCK_ROUTES_ENABLED
if (process.env.MOCK_ROUTES_ENABLED === 'true') {
  console.log('Mock routes are enabled.');
  router.use('/mock', mockRoutes);
}

export default router;
