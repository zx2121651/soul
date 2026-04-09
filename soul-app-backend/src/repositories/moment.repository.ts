import { getDb } from '../db';

export class MomentRepository {
  /**
   * 生产级：获取广场所有动态列表 (支持简单的游标分页、作者信息联表、当前用户是否已点赞的聚合判断)
   * @param viewerId 正在浏览的用户的 ID (用于判断 is_liked)
   * @param limit 每页条数
   * @param lastId 游标(最后一条记录的ID)，如果传0表示第一页
   */
  async findAllWithInteractions(viewerId: number, limit: number = 20, lastId: number = 0) {
    const db = getDb();

    let query = `
      SELECT
        m.id, m.type, m.content as text, m.url as image, m.likes as initialLikes,
        m.created_at as time,
        u.id as user_id, u.name as authorName, u.avatar as authorAvatar,
        EXISTS(SELECT 1 FROM moment_likes ml WHERE ml.moment_id = m.id AND ml.user_id = $1) as isLikedByMe
      FROM moments m
      JOIN users u ON m.user_id = u.id
      WHERE m.status = 'active'
    `;
    const params: any[] = [viewerId, limit];

    // 基于游标的分页 (Cursor Pagination)
    if (lastId > 0) {
      query += ` AND m.id < $3 `;
      params.push(lastId);
    }

    query += ` ORDER BY m.id DESC LIMIT $2 `;

    const result = await db.query(query, params);

    // SQLite 的 EXISTS 会返回 0/1，统一转为 boolean
    return result.rows.map((row: any) => ({
      ...row,
      isLikedByMe: row.isLikedByMe === 1 || row.isLikedByMe === true
    }));
  }

  /**
   * 生产级：获取特定用户的过往所有动态列表
   */
  async findByUserId(userId: number, viewerId: number) {
    const db = getDb();
    const result = await db.query(`
      SELECT
        m.id, m.type, m.content, m.url, m.likes, m.created_at,
        EXISTS(SELECT 1 FROM moment_likes ml WHERE ml.moment_id = m.id AND ml.user_id = $2) as "isLikedByMe"
      FROM moments m
      WHERE m.user_id = $1 AND m.status = 'active'
      ORDER BY m.id DESC
    `, [userId, viewerId]);

    return result.rows.map((row: any) => ({
      ...row,
      isLikedByMe: row.isLikedByMe === 1 || row.isLikedByMe === true
    }));
  }

  /**
   * 生产级：使用事务(Transaction)安全创建一条新动态
   * 如果涉及多个表(例如还要记录到 user_moments_count 表中)，必须保证原子性
   */
  async createWithTransaction(userId: number, type: string, content: string | null, url: string | null) {
    const db = getDb();

    // 因为这里我们用的是 SQLite/PG 混用封装好的 wrapper，如果是纯 PG 我们会写 BEGIN; COMMIT;
    // 这里简单封装一层查询：
    try {
      if (typeof db.query === 'function' && db.query.name !== 'query') {
        // 若使用真实的 PG Pool
        await db.query('BEGIN');
      }

      const insertResult = await db.query(`
        INSERT INTO moments (user_id, type, content, url, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING id, type, content, url, created_at
      `, [userId, type, content, url]);

      // 假设我们这里有一个业务需求：需要更新 user 表的 posts_count 字段 (暂时忽略以兼容目前表结构)
      // await db.query(`UPDATE users SET posts_count = posts_count + 1 WHERE id = $1`, [userId]);

      if (typeof db.query === 'function' && db.query.name !== 'query') {
        await db.query('COMMIT');
      }
      return insertResult.rows[0];
    } catch (e) {
      if (typeof db.query === 'function' && db.query.name !== 'query') {
        await db.query('ROLLBACK');
      }
      throw e;
    }
  }

  /**
   * 生产级：严格的乐观锁点赞操作 (ON CONFLICT 防重复、并原子更新总数)
   */
  async likeMoment(userId: number, momentId: number) {
    const db = getDb();
    // 插入点赞关系，如果有冲突(已经点过赞)则什么都不做
    const res = await db.query(`
      INSERT INTO moment_likes (user_id, moment_id)
      VALUES ($1, $2)
      ON CONFLICT(user_id, moment_id) DO NOTHING
    `, [userId, momentId]);

    // 只有在真正插入成功时，才去更新主表的 likes 冗余字段 (提高查询性能)
    if (res.rowCount && res.rowCount > 0) {
      await db.query(`UPDATE moments SET likes = likes + 1 WHERE id = $1`, [momentId]);
    }
    return true;
  }

  async unlikeMoment(userId: number, momentId: number) {
    const db = getDb();
    // 删除关系记录
    const res = await db.query(`DELETE FROM moment_likes WHERE user_id = $1 AND moment_id = $2`, [userId, momentId]);

    // 只有真的删除了数据，才去递减总数
    if (res.rowCount && res.rowCount > 0) {
      await db.query(`UPDATE moments SET likes = likes - 1 WHERE id = $1 AND likes > 0`, [momentId]);
    }
    return true;
  }
}
