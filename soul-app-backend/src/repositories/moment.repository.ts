import { getDb } from '../db';

export class MomentRepository {
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
}
