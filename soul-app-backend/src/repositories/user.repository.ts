import { getDb } from '../db';

export class UserRepository {
  async findByUuid(uuid: string) {
    const db = getDb();
    const result = await db.query(`SELECT * FROM users WHERE uuid = $1`, [uuid]);
    return result.rows[0] || null;
  }

  async findById(id: number) {
    const db = getDb();
    const result = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findByUsername(username: string) {
    const db = getDb();
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return result.rows[0] || null;
  }

  async createUser(uuid: string, name: string, username: string, passwordHash: string) {
    const db = getDb();
    const result = await db.query(`
      INSERT INTO users (uuid, name, username, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [uuid, name, username, passwordHash]);
    return result.rows[0];
  }

  async follow(followerId: number, followingId: number) {
    const db = getDb();
    await db.query(`INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [followerId, followingId]);
    await db.query(`UPDATE users SET following = following + 1 WHERE id = $1`, [followerId]);
    await db.query(`UPDATE users SET followers = followers + 1 WHERE id = $1`, [followingId]);
    return true;
  }

  async unfollow(followerId: number, followingId: number) {
    const db = getDb();
    const res = await db.query(`DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2`, [followerId, followingId]);
    if (res.rowCount && res.rowCount > 0) {
      await db.query(`UPDATE users SET following = following - 1 WHERE id = $1`, [followerId]);
      await db.query(`UPDATE users SET followers = followers - 1 WHERE id = $1`, [followingId]);
    }
    return true;
  }

  async searchUsers(query: string, limit: number = 20) {
    const db = getDb();
    const result = await db.query(
      `SELECT id, uuid, name, avatar, bio, followers FROM users WHERE name ILIKE $1 OR username ILIKE $1 LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  async getLeaderboard(limit: number = 10) {
    const db = getDb();
    const result = await db.query(`SELECT id, uuid, name, avatar, followers FROM users ORDER BY followers DESC LIMIT $1`, [limit]);
    return result.rows;
  }
}
