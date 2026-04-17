import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { getDb } from '../src/db';

describe('User Moments API (Pagination)', () => {
  let token: string;
  let userId: number;
  let otherUserId: number;
  let momentIds: number[] = [];

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const db = getDb();

    // Create a test user
    const user = await db.user.create({
      data: {
        phone: '13900000001',
        name: 'Moment Author',
        uuid: 'author-uuid',
        passwordHash: 'hashed'
      }
    });
    userId = user.id;

    // Create another user (viewer)
    const viewer = await db.user.create({
      data: {
        phone: '13900000002',
        name: 'Viewer',
        uuid: 'viewer-uuid',
        passwordHash: 'hashed'
      }
    });
    otherUserId = viewer.id;

    // Generate token for viewer
    token = jwt.sign(
      { id: viewer.id, uuid: viewer.uuid, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create 15 moments for the author
    for (let i = 1; i <= 15; i++) {
      const m = await db.moment.create({
        data: {
          authorId: userId,
          content: `Moment ${i}`,
          type: 'text',
          status: 'active',
          createdAt: new Date(2023, 0, i) // Incremental dates
        }
      });
      momentIds.push(m.id);
    }
  });

  afterAll(async () => {
    const db = getDb();
    // Cleanup moments first
    await db.moment.deleteMany({ where: { authorId: userId } });
    // Cleanup users
    await db.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
  });

  it('should fetch the first page of moments', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}/moments?limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.moments).toHaveLength(10);
    expect(res.body.data.nextCursor).not.toBeNull();

    // Moments should be in descending order (ID or createdAt)
    // Our repository uses orderBy { id: 'desc' }
    expect(res.body.data.moments[0].id).toBeGreaterThan(res.body.data.moments[9].id);
  });

  it('should fetch the second page of moments using cursor', async () => {
    // First get first page to get cursor
    const firstPageRes = await request(app)
      .get(`/api/users/${userId}/moments?limit=10`)
      .set('Authorization', `Bearer ${token}`);

    const cursor = firstPageRes.body.data.nextCursor;

    const res = await request(app)
      .get(`/api/users/${userId}/moments?limit=10&cursor=${cursor}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.moments).toHaveLength(5); // 15 total, 10 on first page, 5 on second
    expect(res.body.data.nextCursor).toBeNull();

    // Verify that the first item in second page is the one at the cursor (or following it depending on implementation)
    // In our implementation, cursor {id: cursor} with skip: 1 means it starts AFTER the cursor.
    // Wait, let's check repo implementation:
    // cursor: cursor ? { id: cursor } : undefined,
    // skip: cursor ? 1 : 0,
    // take: limit + 1
    // Yes, it starts after the cursor.
    expect(res.body.data.moments[0].id).toBeLessThan(cursor);
  });

  it('should return empty list if user has no moments', async () => {
    const res = await request(app)
      .get(`/api/users/${otherUserId}/moments`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.moments).toHaveLength(0);
    expect(res.body.data.nextCursor).toBeNull();
  });
});
