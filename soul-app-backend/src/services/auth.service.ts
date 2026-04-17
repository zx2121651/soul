import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../db';
import { SmsService } from './SmsService';
import redis from '../redis';
import { RateLimitException, InvalidOtpException } from '../utils/exceptions';
import { ErrorCode, ErrorMessage } from '../utils/ErrorCodes';

export class AuthService {
  private userRepo = new UserRepository();
  private smsService = new SmsService();

  async sendOtp(phone: string) {
    const minKey = `auth:limit:min:${phone}`;
    const dayKey = `auth:limit:day:${phone}`;

    // 1. Minute-level rate limit
    const minLimit = await redis.get(minKey);
    if (minLimit) {
      throw new RateLimitException(ErrorMessage[ErrorCode.AUTH_SEND_TOO_FREQUENT], ErrorCode.AUTH_SEND_TOO_FREQUENT);
    }

    // 2. Day-level rate limit
    const dayCount = await redis.get(dayKey);
    if (dayCount && parseInt(dayCount) >= 10) {
      throw new RateLimitException(ErrorMessage[ErrorCode.AUTH_SEND_LIMIT_EXCEEDED], ErrorCode.AUTH_SEND_LIMIT_EXCEEDED);
    }

    const code = crypto.randomInt(100000, 999999).toString();

    // Store OTP in Redis with 5 minutes expiration
    const otpKey = `auth:otp:${phone}`;
    await redis.set(otpKey, code, 'EX', 300);

    // Set minute-level limit
    await redis.set(minKey, '1', 'EX', 60);

    // Increment day-level count
    const multi = redis.multi();
    multi.incr(dayKey);

    // If it's a new key (or we just want to ensure it expires), set expiration to end of day
    const now = new Date();
    const secondsUntilEndOfDay = Math.ceil((new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime() - now.getTime()) / 1000);
    multi.expire(dayKey, secondsUntilEndOfDay);
    await multi.exec();

    await this.smsService.sendCode(phone, code);
  }

  async register(username: string, passwordRaw: string, name: string, avatar?: string, interests?: string[]) {
    const existing = await this.userRepo.findByUsername(username);
    if (existing) throw new Error('Username already exists');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordRaw, salt);

    // generate random uuid
    const uuid = crypto.randomUUID();

    const user = await this.userRepo.createUser(uuid, name, username, hash, avatar, interests);
    return user;
  }

  async login(username: string, passwordRaw: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new Error('Invalid credentials');

    if (await bcrypt.compare(passwordRaw, user.passwordHash)) {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('System misconfiguration: missing JWT_SECRET');

      const token = jwt.sign(
        { id: user.id, uuid: user.uuid, role: 'user' },
        secret,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, uuid: user.uuid, tokenVersion: user.tokenVersion },
        secret,
        { expiresIn: '7d' }
      );

      return {
        token,
        refreshToken,
        user: { id: user.id, uuid: user.uuid, name: user.name, avatar: user.avatar }
      };
    }

    throw new Error('Invalid credentials');
  }

  async loginWithOtp(phone: string, code: string) {
    const otpKey = `auth:otp:${phone}`;
    const storedCode = await redis.get(otpKey);

    if (!storedCode || storedCode !== code) {
      throw new InvalidOtpException(ErrorMessage[ErrorCode.AUTH_INVALID_OTP]);
    }

    // verification successful, delete immediately
    await redis.del(otpKey);

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('System misconfiguration: missing JWT_SECRET');

    let user = await this.userRepo.findByPhone(phone);
    if (!user) {
      // New user: Issue a temporary register token
      const registerToken = jwt.sign(
        { phone, type: 'register' },
        secret,
        { expiresIn: '5m' }
      );
      return { requiresRegistration: true, registerToken };
    }

    const token = jwt.sign(
      { userId: user.id, id: user.id, uuid: user.uuid, role: 'user' },
      secret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, uuid: user.uuid, tokenVersion: user.tokenVersion },
      secret,
      { expiresIn: '7d' }
    );

    return {
      requiresRegistration: false,
      token,
      refreshToken,
      user: { id: user.id, uuid: user.uuid, name: user.name, avatar: user.avatar }
    };
  }

  async registerWithToken(registerToken: string, data: { gender: string, birthday: string, nickname: string, avatar?: string, interests?: string[] }) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('System misconfiguration: missing JWT_SECRET');

    let payload: any;
    try {
      payload = jwt.verify(registerToken, secret);
      if (payload.type !== 'register') throw new Error('Invalid token type');
    } catch (err) {
      throw new Error('Invalid or expired register token');
    }

    const { phone } = payload;
    const { gender, birthday, nickname, avatar, interests } = data;

    const db = getDb();

    return await db.$transaction(async (tx: any) => {
      // 1. Check if user already exists (parallel check just in case)
      const existing = await tx.user.findUnique({ where: { phone } });
      if (existing) throw new Error('User already registered');

      // 2. Create User
      const uuid = crypto.randomUUID();
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      const user = await tx.user.create({
        data: {
          uuid,
          phone,
          passwordHash,
          name: nickname,
          gender,
          birthday,
          avatar,
          interests: interests ? JSON.stringify(interests) : null
        }
      });

      // 3. Create initial welcome moment
      await tx.moment.create({
        data: {
          authorId: user.id,
          type: 'text',
          content: '我来到了 Soul，大家快来找我玩',
          status: 'active'
        }
      });

      // 4. Initialize system welcome message
      // Ensure official assistant exists
      const assistant = await tx.user.upsert({
        where: { id: 1 },
        update: {
          name: 'Soul 官方小助手',
          uuid: 'soul_bot_001'
        },
        create: {
          id: 1,
          uuid: 'soul_bot_001',
          phone: '00000000000', // placeholder
          passwordHash: 'official_assistant_placeholder',
          name: 'Soul 官方小助手',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede',
          bio: '为你解答一切疑惑',
          status: 'active'
        }
      });

      // Create chat room
      const room = await tx.chatRoom.create({
        data: {
          members: {
            create: [
              { userId: assistant.id, unreadCount: 0 },
              { userId: user.id, unreadCount: 1 }
            ]
          }
        }
      });

      // Create welcome message
      await tx.chatMessage.create({
        data: {
          roomId: room.id,
          senderId: assistant.id,
          text: '欢迎来到 Soul！去 3D 星球匹配你的第一位灵魂伴侣吧~',
          isRead: false
        }
      });

      // 5. Generate tokens
      const token = jwt.sign(
        { userId: user.id, id: user.id, uuid: user.uuid, role: 'user' },
        secret,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, uuid: user.uuid, tokenVersion: user.tokenVersion },
        secret,
        { expiresIn: '7d' }
      );

      return {
        token,
        refreshToken,
        user: { id: user.id, uuid: user.uuid, name: user.name, avatar: user.avatar }
      };
    });
  }

  async refreshToken(tokenStr: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('System misconfiguration: missing JWT_SECRET');

    try {
      const payload = jwt.verify(tokenStr, secret) as any;

      const user = await this.userRepo.findByUuid(payload.uuid);
      if (!user) throw new Error('User not found');

      // Check token version for revocation
      if (user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Token revoked');
      }

      const token = jwt.sign(
        { userId: user.id, id: user.id, uuid: user.uuid, role: 'user' },
        secret,
        { expiresIn: '15m' }
      );

      // Rotate refresh token
      const newRefreshToken = jwt.sign(
        { id: user.id, uuid: user.uuid, tokenVersion: user.tokenVersion },
        secret,
        { expiresIn: '7d' }
      );

      return { token, refreshToken: newRefreshToken };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }
}
