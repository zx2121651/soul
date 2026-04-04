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
}
