import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { SmsService } from '../../src/services/SmsService';
import redis from '../../src/redis';
import { InvalidOtpException, RateLimitException } from '../../src/utils/exceptions';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from '../../src/db';

jest.mock('../../src/redis', () => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
  call: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  status: 'ready',
  multi: jest.fn().mockReturnValue({
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  })
}));

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/SmsService');
jest.mock('bcryptjs');

const mockTx = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  moment: {
    create: jest.fn(),
  },
  chatRoom: {
    create: jest.fn(),
  },
  chatMessage: {
    create: jest.fn(),
  },
};

jest.mock('../../src/db', () => ({
  getDb: jest.fn().mockReturnValue({
    $transaction: jest.fn((callback) => callback(mockTx)),
  }),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockSmsService: jest.Mocked<SmsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    authService = new AuthService();
    mockUserRepo = (authService as any).userRepo;
    mockSmsService = (authService as any).smsService;
  });

  describe('sendOtp', () => {
    const phone = '13812345678';

    it('should send OTP successfully and set rate limits', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      await authService.sendOtp(phone);

      expect(redis.set).toHaveBeenCalledWith(`auth:otp:${phone}`, expect.any(String), 'EX', 300);
      expect(redis.set).toHaveBeenCalledWith(`auth:limit:min:${phone}`, '1', 'EX', 60);
      expect(mockSmsService.sendCode).toHaveBeenCalledWith(phone, expect.stringMatching(/^\d{6}$/));
    });

    it('should throw RateLimitException if sent too frequently (minute limit)', async () => {
      (redis.get as jest.Mock).mockResolvedValue('1');

      await expect(authService.sendOtp(phone)).rejects.toThrow(RateLimitException);
      await expect(authService.sendOtp(phone)).rejects.toThrow(/发送过于频繁/);
    });

    it('should throw RateLimitException if daily limit exceeded', async () => {
      (redis.get as jest.Mock)
        .mockResolvedValueOnce(null) // min limit
        .mockResolvedValueOnce('10'); // day limit

      await expect(authService.sendOtp(phone)).rejects.toThrow(/当日短信发送次数已达上限/);
    });
  });

  describe('loginWithOtp', () => {
    const phone = '13812345678';
    const code = '123456';

    it('should login successfully for existing user and return valid JWTs', async () => {
      (redis.get as jest.Mock).mockResolvedValue(code);
      const mockUser = {
        id: 1,
        uuid: 'user-uuid',
        name: 'Test User',
        avatar: 'avatar.png',
        tokenVersion: 0,
        phone: phone
      };
      mockUserRepo.findByPhone.mockResolvedValue(mockUser as any);

      const result = await authService.loginWithOtp(phone, code);

      expect(result.requiresRegistration).toBe(false);
      expect(result.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(result.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(result.user?.name).toBe('Test User');
      expect(redis.del).toHaveBeenCalledWith(`auth:otp:${phone}`);
    });

    it('should return requiresRegistration and a register token for new user', async () => {
      (redis.get as jest.Mock).mockResolvedValue(code);
      mockUserRepo.findByPhone.mockResolvedValue(null);

      const result = await authService.loginWithOtp(phone, code);

      expect(result.requiresRegistration).toBe(true);
      expect(result.registerToken).toBeDefined();
      const decoded = jwt.verify(result.registerToken!, 'test-secret') as any;
      expect(decoded.phone).toBe(phone);
      expect(decoded.type).toBe('register');
    });

    it('should throw InvalidOtpException for wrong code', async () => {
      (redis.get as jest.Mock).mockResolvedValue('wrong-code');

      await expect(authService.loginWithOtp(phone, code)).rejects.toThrow(InvalidOtpException);
    });

    it('should throw InvalidOtpException if OTP not found', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      await expect(authService.loginWithOtp(phone, code)).rejects.toThrow(InvalidOtpException);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUserRepo.findByUsername.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepo.createUser.mockResolvedValue({ id: 1, username: 'newuser' } as any);

      const result = await authService.register('newuser', 'password123', 'New User');

      expect(result.id).toBe(1);
      expect(mockUserRepo.createUser).toHaveBeenCalled();
    });

    it('should throw error if username exists', async () => {
      mockUserRepo.findByUsername.mockResolvedValue({ id: 1 } as any);

      await expect(authService.register('existing', 'pass', 'Name')).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        uuid: 'u-uuid',
        name: 'Login User',
        passwordHash: 'hashed',
        tokenVersion: 0
      };
      mockUserRepo.findByUsername.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('user', 'pass');

      expect(result.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(result.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(result.user.name).toBe('Login User');
    });

    it('should throw error for invalid password', async () => {
      mockUserRepo.findByUsername.mockResolvedValue({ passwordHash: 'hashed' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('user', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      mockUserRepo.findByUsername.mockResolvedValue(null);

      await expect(authService.login('none', 'pass')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      const payload = { uuid: 'u-uuid', tokenVersion: 0 };
      const refreshToken = jwt.sign(payload, 'test-secret');
      mockUserRepo.findByUuid.mockResolvedValue({ id: 1, uuid: 'u-uuid', tokenVersion: 0 } as any);

      const result = await authService.refreshToken(refreshToken);

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if token version mismatch', async () => {
      const payload = { uuid: 'u-uuid', tokenVersion: 0 };
      const refreshToken = jwt.sign(payload, 'test-secret');
      mockUserRepo.findByUuid.mockResolvedValue({ id: 1, uuid: 'u-uuid', tokenVersion: 1 } as any);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Token revoked');
    });

    it('should throw error for expired token', async () => {
      const refreshToken = jwt.sign({ uuid: 'u' }, 'test-secret', { expiresIn: '-1s' });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Refresh token expired');
    });
  });

  describe('registerWithToken', () => {
    const registerToken = jwt.sign({ phone: '13800000000', type: 'register' }, 'test-secret');
    const registerData = {
      gender: 'male',
      birthday: '1990-01-01',
      nickname: 'SoulUser',
      interests: ['music', 'coding']
    };

    it('should complete registration successfully', async () => {
      mockTx.user.findUnique.mockResolvedValue(null);
      mockTx.user.create.mockResolvedValue({
        id: 10,
        uuid: 'new-uuid',
        name: 'SoulUser',
        tokenVersion: 0
      });
      mockTx.user.upsert.mockResolvedValue({ id: 1, name: 'Assistant' });
      mockTx.chatRoom.create.mockResolvedValue({ id: 100 });

      const result = await authService.registerWithToken(registerToken, registerData);

      expect(result.token).toBeDefined();
      expect(result.user.name).toBe('SoulUser');
      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockTx.moment.create).toHaveBeenCalled();
      expect(mockTx.chatMessage.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      mockTx.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(authService.registerWithToken(registerToken, registerData)).rejects.toThrow('User already registered');
    });

    it('should throw error for invalid token type', async () => {
      const invalidToken = jwt.sign({ phone: '138', type: 'login' }, 'test-secret');
      await expect(authService.registerWithToken(invalidToken, registerData)).rejects.toThrow('Invalid or expired register token');
    });
  });
});
