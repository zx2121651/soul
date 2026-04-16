import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SmsService } from './SmsService';
import redis from '../redis';
import { RateLimitException } from '../utils/exceptions';
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

  async register(username: string, passwordRaw: string, name: string) {
    const existing = await this.userRepo.findByUsername(username);
    if (existing) throw new Error('Username already exists');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordRaw, salt);

    // generate random uuid
    const uuid = crypto.randomUUID();

    const user = await this.userRepo.createUser(uuid, name, username, hash);
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
        { expiresIn: '7d' }
      );

      return {
        token,
        user: { id: user.id, uuid: user.uuid, name: user.name, avatar: user.avatar }
      };
    }

    throw new Error('Invalid credentials');
  }
}
