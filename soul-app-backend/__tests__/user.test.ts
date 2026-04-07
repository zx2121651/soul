import request from 'supertest';
import app from '../src/app';

describe('User API', () => {
  it('should reject unauthenticated access to /me', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未提供认证 Token');
  });

  it('should reject invalid token', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer bad-token');
    // Without env JWT_SECRET, verify throws or our middleware throws 500
    // let's set a fake env var for test
    process.env.JWT_SECRET = 'test';
    const res2 = await request(app).get('/api/users/me').set('Authorization', 'Bearer bad-token');
    expect(res2.status).toBe(403);
    expect(res2.body.message).toBe('Token 无效或已过期');
  });
});
