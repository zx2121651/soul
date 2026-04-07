import { getDb } from '../db';

export class ChatRepository {
  // 获取聊天列表
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
        u.id as other_user_id,
        u.uuid as other_user_uuid,
        lm.last_message,
        lm.time,
        (u.uuid = 'soul_bot_001') as is_official
      FROM chat_rooms c
      JOIN chat_room_members crm ON c.id = crm.room_id AND crm.user_id != $1
      JOIN users u ON crm.user_id = u.id
      LEFT JOIN LatestMessages lm ON c.id = lm.room_id AND lm.rn = 1
      WHERE c.id IN (SELECT room_id FROM MyRooms)
      ORDER BY lm.time DESC ;
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // 获取特定房间的消息
  async findMessagesByRoomId(roomId: number) {
    const db = getDb();
    const query = `
      SELECT m.id, m.sender_id, m.text, m.created_at as time
      FROM chat_messages m
      WHERE m.room_id = $1
      ORDER BY m.created_at ASC;
    `;
    const result = await db.query(query, [roomId]);
    return result.rows;
  }

  // 发送消息
  async saveMessage(roomId: number, senderId: number, text: string) {
    const db = getDb();
    const query = `
      INSERT INTO chat_messages (room_id, sender_id, text)
      VALUES ($1, $2, $3)
      RETURNING id, sender_id, text, created_at as time;
    `;
    const result = await db.query(query, [roomId, senderId, text]);
    return result.rows[0];
  }

  // 获取或者创建房间
  async getOrCreateRoom(userId1: number, userId2: number) {
    const db = getDb();

    // 检查是否已经存在这两个人的房间
    const checkQuery = `
      SELECT room_id
      FROM chat_room_members
      WHERE user_id IN ($1, $2)
      GROUP BY room_id
      HAVING COUNT(DISTINCT user_id) = 2;
    `;
    const checkResult = await db.query(checkQuery, [userId1, userId2]);

    if (checkResult.rows.length > 0) {
      return checkResult.rows[0].room_id; // 返回已有的房间ID
    }

    // 创建新房间
    const createRoomQuery = `INSERT INTO chat_rooms DEFAULT VALUES RETURNING id;`;
    const roomResult = await db.query(createRoomQuery);
    const roomId = roomResult.rows[0].id;

    // 添加成员
    const addMembersQuery = `
      INSERT INTO chat_room_members (room_id, user_id)
      VALUES ($1, $2), ($1, $3);
    `;
    await db.query(addMembersQuery, [roomId, userId1, userId2]);

    return roomId;
  }
}
