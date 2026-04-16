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

  it('should refresh accessToken with a valid refreshToken cookie', async () => {
    (redis.get as jest.Mock).mockResolvedValue(code);

    // 1. Login to get a refreshToken cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ phone, code });

    const cookies = loginRes.get('Set-Cookie');
    const refreshTokenCookie = cookies?.find(c => c.startsWith('refreshToken=')) || '';

    // 2. Call /refresh with the cookie
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [refreshTokenCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.code).toBe(0);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // Check that a new refreshToken cookie is set (Rotation)
    const newCookies = refreshRes.get('Set-Cookie');
    expect(newCookies).toBeDefined();
    expect(newCookies?.find(c => c.startsWith('refreshToken='))).toBeDefined();
  });

  it('should return 401 if no refreshToken cookie is provided', async () => {
    const res = await request(app)
      .post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(1001); // AUTH_UNAUTHORIZED
  });

  it('should return 401 if refreshToken is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=invalid-token']);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(1002); // AUTH_INVALID_TOKEN
  });
});
