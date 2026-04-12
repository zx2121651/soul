import { getDb } from '../db';
import { Prisma } from '@prisma/client';

export class ChatRepository {
  async isUserBlocked(senderId: number, receiverId: number) {
    const res = await getDb().userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: receiverId, blockedId: senderId } }
    });
    return !!res;
  }

  async findChatListByUserId(userId: number) {
    // 复杂查询：查询当前用户所在的私聊房间，及该房间的最新一条消息
    const rooms = await getDb().chatRoomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            members: {
              where: { userId: { not: userId } },
              include: { user: { select: { id: true, uuid: true, name: true, avatar: true } } }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    return rooms.map(m => {
      const room = m.room;
      const partner = room.members[0]?.user;
      const lastMsg = room.messages[0];
      return {
        room_id: room.id,
        name: partner?.name || '未知用户',
        avatar: partner?.avatar,
        other_user_id: partner?.id,
        other_user_uuid: partner?.uuid,
        last_message: lastMsg ? lastMsg.text : null,
        time: lastMsg ? lastMsg.createdAt : room.createdAt,
        is_official: partner?.uuid === 'soul_bot_001',
        unread_count: m.unreadCount
      };
    }).sort((a, b) => b.time.getTime() - a.time.getTime());
  }

  async findMessagesByRoomId(roomId: number) {
    return await getDb().chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async saveMessage(roomId: number, senderId: number, text: string) {
    return await getDb().$transaction(async (tx) => {
      const msg = await tx.chatMessage.create({
        data: { roomId, senderId, text }
      });
      await tx.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() }
      });
      return msg;
    });
  }

  async getOrCreateRoom(userId1: number, userId2: number) {
    const db = getDb();
    // 查找是否已有共有房间
    const existingRooms = await db.chatRoomMember.groupBy({
      by: ['roomId'],
      where: { userId: { in: [userId1, userId2] } },
      having: { roomId: { _count: { equals: 2 } } }
    });

    if (existingRooms.length > 0) {
      return existingRooms[0].roomId;
    }

    // 创建新房间
    const newRoom = await db.chatRoom.create({
      data: {
        members: {
          create: [{ userId: userId1 }, { userId: userId2 }]
        }
      }
    });
    return newRoom.id;
  }
}
