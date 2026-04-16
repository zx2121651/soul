import redis from '../src/redis';
import { AuthService } from '../src/services/auth.service';

jest.mock('../src/redis', () => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn()
}));

jest.mock('../src/services/SmsService', () => {
  return {
    SmsService: jest.fn().mockImplementation(() => {
      return {
        sendCode: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('AuthService OTP with Redis', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  it('should store OTP in Redis with 300s TTL when sending code', async () => {
    const phone = '13800138000';
    await authService.sendOtp(phone);

    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:otp:13800138000$/),
      expect.stringMatching(/^\d{6}$/),
      'EX',
      300
    );
  });

  it('should overwrite old OTP and reset TTL when sending code again', async () => {
    const phone = '13800138000';

    // First call
    await authService.sendOtp(phone);
    const firstCallCode = (redis.set as jest.Mock).mock.calls[0][1];

    // Second call
    await authService.sendOtp(phone);

    expect(redis.set).toHaveBeenCalledTimes(2);
    expect(redis.set).toHaveBeenLastCalledWith(
      `auth:otp:${phone}`,
      expect.any(String),
      'EX',
      300
    );
  });
});
