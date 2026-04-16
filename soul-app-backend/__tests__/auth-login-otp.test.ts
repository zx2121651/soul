import request from 'supertest';
import app from '../src/app';
import redis from '../src/redis';

// Note: setup.ts already mocks redis, so we just need to use those mocks.

describe('Auth Login OTP Integration', () => {
  const phone = '13812345678';
  const code = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with correct OTP', async () => {
    (redis.get as jest.Mock).mockResolvedValue(code);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone, code });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.id).toBeDefined();
    expect(redis.del).toHaveBeenCalledWith(`auth:otp:${phone}`);
  });

  it('should return 401 for incorrect OTP', async () => {
    (redis.get as jest.Mock).mockResolvedValue('654321');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone, code });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(1007);
    expect(res.body.message).toBe('验证码错误或已过期');
  });

  it('should return 401 for expired/missing OTP', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone, code });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(1007);
  });

  it('should return 400 for invalid phone format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone: '123', code: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(2001);
  });
});
