import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { getDb } from '../src/db';

describe('User API', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    // Create a test user
    const user = await getDb().user.upsert({
      where: { phone: '13800138000' },
      update: {},
      create: {
        phone: '13800138000',
        name: 'Test User',
        passwordHash: 'hashed_password',
        interests: JSON.stringify(['music', 'travel'])
      }
    });
    userId = user.id;

    // Generate token
    token = jwt.sign(
      { id: user.id, uuid: user.uuid, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await getDb().user.delete({ where: { id: userId } });
  });

  it('should reject unauthenticated access to /me', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未提供认证 Token');
  });

  it('should reject invalid token with 401', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer bad-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token 无效或已过期');
  });

  it('should return filtered user profile for /me', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);

    const profile = res.body.data.profile;

    // Check required fields
    expect(profile.uuid).toBeDefined();
    expect(profile.phone).toBe('13800138000');
    expect(profile.name).toBe('Test User');
    expect(profile.interests).toEqual(['music', 'travel']);

    // Check sensitive fields are NOT present
    expect(profile.passwordHash).toBeUndefined();
    expect(profile.id).not.toBe(userId); // profile.id is mapped to uuid

    // If we want to be strict about numeric id not being there at all:
    // Some implementations might still have 'id' if they map uuid to id
    // but the requirement says "绝不能把底层自增 id 暴露给前端"
    // In our implementation we have profile.id = user.uuid
    // Let's check there's no numeric id
    Object.keys(profile).forEach(key => {
        if (key === 'id') {
            expect(typeof profile[key]).toBe('string');
        } else {
            expect(key).not.toBe('userId'); // some might use userId
        }
    });
  });
});
