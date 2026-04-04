import request from 'supertest';
import app from '../src/app';

jest.mock('../src/services/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        register: jest.fn().mockResolvedValue({ id: 1, uuid: 'u1', username: 'testuser' }),
        login: jest.fn().mockResolvedValue({ token: 'mock-jwt-token', user: { name: 'test' } })
      };
    })
  };
});

describe('Authentication API', () => {
  it('should reject login without username', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should accept valid login', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'testuser', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.token).toBeDefined();
  });
});
