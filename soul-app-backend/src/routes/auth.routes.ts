import { Router } from 'express';
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
