import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import { ErrorCode } from '../../src/utils/ErrorCodes';

describe('Upload Routes', () => {
  const secret = process.env.JWT_SECRET || 'soul-secret';
  const validToken = jwt.sign(
    { id: 1, uuid: 'test-uuid', role: 'user' },
    secret
  );

  describe('GET /api/upload/presigned-url', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/upload/presigned-url');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe(ErrorCode.AUTH_UNAUTHORIZED);
    });

    it('should return 400 if fileName or mimeType is missing', async () => {
      const res = await request(app)
        .get('/api/upload/presigned-url')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should return 200 and presigned URL on success', async () => {
      const res = await request(app)
        .get('/api/upload/presigned-url')
        .query({ fileName: 'avatar.jpg', mimeType: 'image/jpeg' })
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('uploadUrl');
      expect(res.body.data).toHaveProperty('objectKey');
      expect(res.body.data).toHaveProperty('publicUrl');
      expect(res.body.data.objectKey).toContain('avatars/test-uuid/');
      expect(res.body.data.objectKey).toContain('avatar.jpg');
    });
  });
});
