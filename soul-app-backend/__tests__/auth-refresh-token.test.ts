import request from 'supertest';
import app from '../src/app';
import redis from '../src/redis';

describe('Auth Refresh Token Integration', () => {
  const phone = '13888888888';
  const code = '666666';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set refreshToken cookie on successful login', async () => {
    (redis.get as jest.Mock).mockResolvedValue(code);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone, code });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);

    // Check that AccessToken is in the body
    expect(res.body.data.token).toBeDefined();

    // Check that RefreshToken is NOT in the body
    expect(res.body.data.refreshToken).toBeUndefined();

    // Check that RefreshToken is in the cookies
    const cookies = res.get('Set-Cookie');
    expect(cookies).toBeDefined();

    const refreshTokenCookie = cookies?.find(c => c.startsWith('refreshToken='));
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('HttpOnly');
    expect(refreshTokenCookie).toContain('SameSite=Strict');
  });
});
