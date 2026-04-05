import { getDb } from '../db';

export class ChatRepository {
  async findChatListByUserId(userId: number) {
    const db = getDb();

    // 复杂联表查询：查找我所在的聊天室、对方的信息、以及该房间最后一条消息
    const query = `
      WITH MyRooms AS (
        SELECT room_id FROM chat_room_members WHERE user_id = $1
      ),
      LatestMessages AS (
        SELECT
          room_id,
          text as last_message,
          created_at as time,
          ROW_NUMBER() OVER(PARTITION BY room_id ORDER BY created_at DESC) as rn
        FROM chat_messages
        WHERE room_id IN (SELECT room_id FROM MyRooms)
      )
      SELECT
        c.id as room_id,
        u.name,
        u.avatar,
        u.uuid as other_user_uuid,
        lm.last_message,
        lm.time,
        (u.uuid = 'soul_bot_001') as is_official
      FROM chat_rooms c
      JOIN chat_room_members crm ON c.id = crm.room_id AND crm.user_id != $1
      JOIN users u ON crm.user_id = u.id
      LEFT JOIN LatestMessages lm ON c.id = lm.room_id AND lm.rn = 1
      WHERE c.id IN (SELECT room_id FROM MyRooms)
      ORDER BY lm.time DESC NULLS LAST;
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }
}
