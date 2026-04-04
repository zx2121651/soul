import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

const router = Router();
const authService = new AuthService();

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars"),
  password: z.string().min(6, "Password must be at least 6 chars").optional()
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 chars"),
  password: z.string().min(6, "Password must be at least 6 chars")
});

router.post('/login', async (req, res, next) => {
  try {
    const parseRes = loginSchema.safeParse(req.body);
    if (!parseRes.success) return sendError(res, 400, parseRes.error.issues[0].message);

    const { username, password } = parseRes.data;

    // allow implicit fallback pass for "testuser" if no password supplied for ease of testing UI
    const data = await authService.login(username, password || '');
    sendSuccess(res, data, '登录成功');
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return sendError(res, 401, '用户名或密码错误');
    }
    if (error.message.includes('System misconfiguration')) {
      return sendError(res, 500, error.message);
    }
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const parseRes = registerSchema.safeParse(req.body);
    if (!parseRes.success) return sendError(res, 400, parseRes.error.issues[0].message);

    const { name, username, password } = parseRes.data;

    await authService.register(username, password, name);
    sendSuccess(res, null, '注册成功');
  } catch (error: any) {
    if (error.message === 'Username already exists') {
      return sendError(res, 409, '用户名已存在');
    }
    next(error);
  }
});

export default router;
