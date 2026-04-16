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
    (redis.get as jest.Mock).mockResolvedValue(null);
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
    (redis.get as jest.Mock).mockResolvedValue(null);

    // First call
    await authService.sendOtp(phone);

    // Mock redis.get to return null again for the second call (mimicking passing time/different keys)
    (redis.get as jest.Mock).mockResolvedValue(null);

    // Second call
    await authService.sendOtp(phone);

    // 2 calls to set OTP + 2 calls to set minute limit = 4
    expect(redis.set).toHaveBeenCalledTimes(4);
    expect(redis.set).toHaveBeenCalledWith(
      `auth:otp:${phone}`,
      expect.any(String),
      'EX',
      300
    );
  });
});
