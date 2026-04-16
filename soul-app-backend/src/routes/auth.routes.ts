import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';
import { ErrorCode } from '../utils/ErrorCodes';
import { authMiddleware } from '../middlewares/auth.middleware';
import redis from '../redis';

const router = Router();
const authService = new AuthService();

const loginSchema = z.union([
  z.object({
    phone: z.string().regex(/^1[3-9]\d{9}$|^\+[1-9]\d{1,14}$/, "手机号格式不正确"),
    code: z.string().length(6, "验证码必须是6位数字")
  }),
  z.object({
    username: z.string().min(3),
    password: z.string().min(6)
  })
]);

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 chars"),
  password: z.string().min(6, "Password must be at least 6 chars"),
  avatar: z.string().optional()
});

const sendCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$|^\+[1-9]\d{1,14}$/, "手机号格式不正确")
});

router.post('/send-code', async (req, res, next) => {
  try {
    const parseRes = sendCodeSchema.safeParse(req.body);
    if (!parseRes.success) {
      return sendError(res, 400, parseRes.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
    }

    const { phone } = parseRes.data;
    await authService.sendOtp(phone);
    sendSuccess(res, null, '验证码发送成功');
  } catch (error: any) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parseRes = loginSchema.safeParse(req.body);
    if (!parseRes.success) return sendError(res, 400, parseRes.error.issues[0].message, ErrorCode.VALIDATION_ERROR);

    const loginData = parseRes.data;
    let result;

    if ('phone' in loginData) {
      result = await authService.loginWithOtp(loginData.phone, loginData.code);
    } else {
      result = await authService.login(loginData.username, loginData.password);
    }

    const { token, refreshToken, user } = result;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000 // 7 days
    });

    sendSuccess(res, { token, user }, '登录成功');
  } catch (error: any) {
    if (error.message === 'Invalid OTP') {
      return sendError(res, 401, undefined, ErrorCode.AUTH_INVALID_OTP);
    }
    if (error.message === 'Invalid credentials') {
      return sendError(res, 401, undefined, ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
    if (error.message.includes('System misconfiguration')) {
      return sendError(res, 500, error.message, ErrorCode.SYSTEM_MISCONFIGURED);
    }
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const parseRes = registerSchema.safeParse(req.body);
    if (!parseRes.success) return sendError(res, 400, parseRes.error.issues[0].message, ErrorCode.VALIDATION_ERROR);

    const { name, username, password, avatar } = parseRes.data;

    await authService.register(username, password, name, avatar);
    sendSuccess(res, null, '注册成功');
  } catch (error: any) {
    if (error.message === 'Username already exists') {
      return sendError(res, 409, undefined, ErrorCode.AUTH_USER_EXISTS);
    }
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return sendError(res, 401, '未提供 Refresh Token', ErrorCode.AUTH_UNAUTHORIZED);
    }

    const { token, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000 // 7 days
    });

    sendSuccess(res, { accessToken: token }, 'Token 续期成功');
  } catch (error: any) {
    if (error.message === 'Refresh token expired' || error.name === 'JsonWebTokenError' || error.message === 'Token revoked' || error.message === 'User not found') {
      return sendError(res, 401, 'Refresh Token 无效或已过期', ErrorCode.AUTH_INVALID_TOKEN);
    }
    next(error);
  }
});

router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization!;
    const token = authHeader.split(' ')[1];
    const user = req.user!;

    if (user.exp) {
      const ttl = user.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.set(`auth:blacklist:${token}`, 'revoked', 'EX', ttl);
      }
    }

    res.clearCookie('refreshToken');
    sendSuccess(res, null, '注销成功');
  } catch (error) {
    next(error);
  }
});

export default router;
