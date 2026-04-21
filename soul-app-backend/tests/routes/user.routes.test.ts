import request from 'supertest';
import app from '../../src/app';
import { UserService } from '../../src/services/user.service';
import { ErrorCode } from '../../src/utils/ErrorCodes';
import jwt from 'jsonwebtoken';
import { config } from '../../src/utils/config';

jest.mock('../../src/services/user.service');

describe('User Routes - Profile Update', () => {
  let mockUserService: jest.Mocked<UserService>;
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = UserService.prototype as any;

    // Generate a valid token for authMiddleware
    authToken = jwt.sign({ id: 1, uuid: 'user-uuid' }, config.JWT_SECRET);
  });

  describe('PUT /api/users/me', () => {
    const validData = {
      name: 'ValidName',
      bio: 'This is a valid bio.',
      avatar: 'https://mock-oss.com/avatar.jpg'
    };

    it('should update profile successfully with valid data', async () => {
      mockUserService.updateProfile.mockResolvedValue({
        profile: {
          id: 'user-uuid',
          uuid: 'user-uuid',
          phone: '13812345678',
          name: 'ValidName',
          avatar: 'https://mock-oss.com/avatar.jpg',
          bio: 'This is a valid bio.',
          interests: [],
          followersCount: 0,
          followingCount: 0
        }
      } as any);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validData);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.profile.name).toBe('ValidName');
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(1, validData);
    });

    it('should return 400 for invalid nickname (too short)', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validData, name: 'A' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(res.body.message).toContain('昵称长度需在 2-12 个字符之间');
    });

    it('should return 400 for invalid nickname (contains bad words)', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validData, name: 'SoulAdmin' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(res.body.message).toContain('昵称包含不合适的内容');
    });

    it('should return 400 for invalid bio (too long)', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validData, bio: 'a'.repeat(101) });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(res.body.message).toContain('签名长度不能超过 100 个字符');
    });

    it('should return 400 for invalid avatar URL (not in whitelist)', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validData, avatar: 'https://malicious-site.com/hack.jpg' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(res.body.message).toContain('非法的头像上传域名');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .send(validData);

      expect(res.status).toBe(401);
    });
  });
});
