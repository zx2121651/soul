import request from 'supertest';
import app from '../src/app';
import redis from '../src/redis';
import { getDb } from '../src/db';
import jwt from 'jsonwebtoken';

describe('Auth Registration Transaction Integration', () => {
  const phone = '13900001111';
  const code = '123456';
  const db = getDb();

  beforeEach(async () => {
    jest.clearAllMocks();
    // Clean up test user and their moments
    const user = await db.user.findUnique({ where: { phone } });
    if (user) {
      await db.moment.deleteMany({ where: { authorId: user.id } });
      await db.user.delete({ where: { phone } });
    }
  });

  it('should return registerToken for new user login with OTP', async () => {
    (redis.get as jest.Mock).mockResolvedValue(code);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone, code });

    expect(res.status).toBe(200);
    expect(res.body.data.requiresRegistration).toBe(true);
    expect(res.body.data.registerToken).toBeDefined();

    // Verify token
    const decoded = jwt.verify(res.body.data.registerToken, process.env.JWT_SECRET || 'test_secret') as any;
    expect(decoded.phone).toBe(phone);
    expect(decoded.type).toBe('register');
  });

  it('should register successfully with valid registerToken', async () => {
    // 1. Get token
    (redis.get as jest.Mock).mockResolvedValue(code);
    const loginRes = await request(app).post('/api/auth/login').send({ phone, code });
    const registerToken = loginRes.body.data.registerToken;

    // 2. Register
    const registerData = {
      registerToken,
      gender: 'male',
      birthday: '1995-01-01',
      nickname: 'TestUser',
      interests: ['coding', 'music']
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(registerData);

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe('TestUser');

    // 3. Verify database
    const user = await db.user.findUnique({
      where: { phone },
      include: { moments: true }
    });
    expect(user).toBeDefined();
    expect(user?.gender).toBe('male');
    expect(user?.birthday).toBe('1995-01-01');
    expect(user?.moments.length).toBe(1);
    expect(user?.moments[0].content).toBe('我来到了 Soul，大家快来找我玩');
  });

  it('should reject registration with invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        registerToken: 'invalid_token',
        gender: 'male',
        birthday: '1995-01-01',
        nickname: 'TestUser'
      });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(1002);
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        registerToken: 'some_token'
        // missing fields
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(2001);
  });
});
