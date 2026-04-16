import request from 'supertest';
import app from '../src/app';
import redis from '../src/redis';

// Note: redis is already mocked in __tests__/setup.ts

describe('Auth Rate Limiting', () => {
  const phone = '13812345678';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow sending OTP when no limits are exceeded', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/auth/send-code').send({ phone });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
  });

  it('should return 429 when minute-level limit is exceeded', async () => {
    (redis.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('limit:min')) return Promise.resolve('1');
      return Promise.resolve(null);
    });

    const res = await request(app).post('/api/auth/send-code').send({ phone });

    expect(res.status).toBe(429);
    expect(res.body.code).toBe(1005);
    expect(res.body.message).toBe('发送过于频繁，请 60 秒后再试');
  });

  it('should return 429 when day-level limit is exceeded', async () => {
    (redis.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('limit:min')) return Promise.resolve(null);
      if (key.includes('limit:day')) return Promise.resolve('10');
      return Promise.resolve(null);
    });

    const res = await request(app).post('/api/auth/send-code').send({ phone });

    expect(res.status).toBe(429);
    expect(res.body.code).toBe(1006);
    expect(res.body.message).toBe('当日短信发送次数已达上限');
  });

  it('should set redis keys and increment day counter on successful send', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    const multiMock = {
      incr: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    };
    (redis.multi as jest.Mock).mockReturnValue(multiMock);

    await request(app).post('/api/auth/send-code').send({ phone });

    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining(`auth:limit:min:${phone}`),
      '1',
      'EX',
      60
    );
    expect(multiMock.incr).toHaveBeenCalledWith(expect.stringContaining(`auth:limit:day:${phone}`));
    expect(multiMock.expire).toHaveBeenCalledWith(expect.stringContaining(`auth:limit:day:${phone}`), expect.any(Number));
  });
});
