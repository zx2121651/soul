import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';
import { ErrorCode } from '../utils/ErrorCodes';

const router = Router();
const authService = new AuthService();

const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$|^\+[1-9]\d{1,14}$/, "手机号格式不正确"),
  code: z.string().length(6, "验证码必须是6位数字")
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 chars"),
  password: z.string().min(6, "Password must be at least 6 chars")
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

    const { phone, code } = parseRes.data;

    const data = await authService.loginWithOtp(phone, code);
    sendSuccess(res, data, '登录成功');
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

    const { name, username, password } = parseRes.data;

    await authService.register(username, password, name);
    sendSuccess(res, null, '注册成功');
  } catch (error: any) {
    if (error.message === 'Username already exists') {
      return sendError(res, 409, undefined, ErrorCode.AUTH_USER_EXISTS);
    }
    next(error);
  }
});

export default router;
