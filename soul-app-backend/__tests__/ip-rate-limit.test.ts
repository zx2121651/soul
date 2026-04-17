import request from 'supertest';
import app from '../src/app';
import redis from '../src/redis';

describe('IP-based Rate Limiting', () => {
  jest.setTimeout(20000);
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 429 for login after 20 requests', async () => {
    // Mock redis.call for rate-limit-redis
    // The first 20 calls return current count <= 20
    // The 21st call returns current count > 20
    let callCount = 0;
    (redis.call as jest.Mock).mockImplementation((command, ...args) => {
      const cmd = command.toLowerCase();
      if (cmd === 'script') return Promise.resolve('mock-sha');
      if (cmd === 'evalsha' || cmd === 'eval') {
        callCount++;
        return Promise.resolve([callCount, Date.now() + 1000]);
      }
      return Promise.resolve();
    });

    // Make 20 requests
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'password' });

      // They might fail with 401 if credentials are wrong, but they shouldn't be 429 from rate limiter yet
      expect(res.status).not.toBe(429);
    }

    // 21st request
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'password' });

    expect(res.status).toBe(429);
    expect(res.body.message).toContain('登录尝试过于频繁');

    // Check if redis was called with the correct prefix
    expect(redis.call).toHaveBeenCalledWith(
        expect.stringMatching(/eval/i),
        expect.any(String),
        "1",
        expect.stringContaining('rl:login:'),
        expect.any(String),
        expect.any(String)
    );
  });

  it('should return 429 for send-code after 10 requests', async () => {
    jest.setTimeout(20000);
    let callCount = 0;
    (redis.call as jest.Mock).mockImplementation((command, ...args) => {
      const cmd = command.toLowerCase();
      if (cmd === 'script') return Promise.resolve('mock-sha');
      if (cmd === 'evalsha' || cmd === 'eval') {
        callCount++;
        return Promise.resolve([callCount, Date.now() + 1000]);
      }
      return Promise.resolve();
    });

    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/auth/send-code')
        .send({ phone: '13800138000' });

      expect(res.status).not.toBe(429);
    }

    // 11th request
    const res = await request(app)
      .post('/api/auth/send-code')
      .send({ phone: '13800138000' });

    expect(res.status).toBe(429);
    expect(res.body.message).toContain('短信发送过于频繁');

    // Check if redis was called with the correct prefix
    expect(redis.call).toHaveBeenCalledWith(
        expect.stringMatching(/eval/i),
        expect.any(String),
        "1",
        expect.stringContaining('rl:sms:'),
        expect.any(String),
        expect.any(String)
    );
  });
});
