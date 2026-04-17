import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../redis';
import { sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';

// 策略 A（发短信）：同一 IP 每小时最多请求 10 次
export const smsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - Known issue with types in rate-limit-redis/ioredis compatibility
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:sms:',
  }),
  handler: (req, res) => {
    sendError(res, 429, '短信发送过于频繁，请一小时后再试', ErrorCode.AUTH_SEND_LIMIT_EXCEEDED);
  },
});

// 策略 B（登录尝试）：同一 IP 每 15 分钟最多尝试 20 次
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - Known issue with types in rate-limit-redis/ioredis compatibility
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:login:',
  }),
  handler: (req, res) => {
    sendError(res, 429, '登录尝试过于频繁，请 15 分钟后再试', ErrorCode.AUTH_UNAUTHORIZED);
  },
});
