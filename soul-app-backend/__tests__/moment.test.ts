import request from 'supertest';
import app from '../src/app';

jest.mock('../src/services/moment.service', () => {
  return {
    MomentService: jest.fn().mockImplementation(() => {
      return {
        createMoment: jest.fn().mockResolvedValue({ id: 1, type: 'text', content: 'test content' })
      };
    })
  };
});

describe('Moment API', () => {
  it('should reject posting moment without token', async () => {
    const res = await request(app).post('/api/moments').send({ content: 'test' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未提供认证 Token');
  });

  it('should allow posting moment with valid token', async () => {
    process.env.JWT_SECRET = 'test';
    // sign a quick token just to bypass middleware jsonwebtoken check
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1, uuid: 'u1' }, 'test');

    const res = await request(app)
      .post('/api/moments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'test content', type: 'text' });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.moment.content).toBe('test content');
  });
});
