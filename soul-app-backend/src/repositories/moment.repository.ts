import { getDb } from '../db';

export class MomentRepository {
  // 获取所有动态（广场列表），包含用户信息和点赞数
  async findAll() {
    const db = getDb();
    const result = await db.query(`
      SELECT
        m.id, m.type, m.content as text, m.url as image, m.likes as initialLikes,
        m.created_at as time,
        u.id as user_id, u.name as "authorName", u.avatar as "authorAvatar"
      FROM moments m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    return result.rows;
  }

  async findByUserId(userId: number) {
    const db = getDb();
    const result = await db.query(
      `SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );
    return result.rows;
  }

  async create(userId: number, type: string, content: string | null, url: string | null) {
    const db = getDb();
    const insertResult = await db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userId, type, content, url]);
    return insertResult.rows[0];
  }

  async likeMoment(userId: number, momentId: number) {
    const db = getDb();
    const res = await db.query(`INSERT INTO moment_likes (user_id, moment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, momentId]);
    if (res.rowCount && res.rowCount > 0) {
      await db.query(`UPDATE moments SET likes = likes + 1 WHERE id = $1`, [momentId]);
    }
    return true;
  }

  async unlikeMoment(userId: number, momentId: number) {
    const db = getDb();
    const res = await db.query(`DELETE FROM moment_likes WHERE user_id = $1 AND moment_id = $2`, [userId, momentId]);
    if (res.rowCount && res.rowCount > 0) {
      await db.query(`UPDATE moments SET likes = likes - 1 WHERE id = $1`, [momentId]);
    }
    return true;
  }
}
