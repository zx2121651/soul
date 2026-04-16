import request from 'supertest';
import app from '../src/app';
import redis from '../src/redis';
import jwt from 'jsonwebtoken';

describe('Auth Logout API', () => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  let token: string;
  const userPayload = { id: 1, uuid: 'u1', role: 'user' };

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
    token = jwt.sign(userPayload, secret, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should logout successfully and clear cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.message).toBe('注销成功');

    // Check if refreshToken cookie is cleared
    const setCookie = res.get('Set-Cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie![0]).toContain('refreshToken=;');

    // Check if token was added to blacklist in Redis
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining(`auth:blacklist:${token}`),
      'revoked',
      'EX',
      expect.any(Number)
    );
  });

  it('should reject blacklisted token', async () => {
    // Mock redis.get to return 'revoked' for this token
    (redis.get as jest.Mock).mockResolvedValueOnce('revoked');

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token 已失效');
  });

  it('should return 401 for logout without token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});
