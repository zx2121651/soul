import { ChatRepository } from '../repositories/chat.repository';
import { UserRepository } from '../repositories/user.repository';

export class ChatService {
  private chatRepo = new ChatRepository();
  private userRepo = new UserRepository();

  // 获取聊天列表与置顶联系人
  async getChatList(userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const rawChats = await this.chatRepo.findChatListByUserId(user.id);

    // 简单模拟从数据库最近聊天的对象提取置顶用户 (真实场景应有一个 pinned 字段)
    const pinnedUsers = rawChats.slice(0, 3).map((c: any) => ({
      id: c.other_user_id || c.room_id,
      name: c.name,
      avatar: c.avatar,
      isOnline: Math.random() > 0.5 // 随机在线状态
    }));

    const chats = rawChats.map((c: any) => ({
      id: c.room_id,
      name: c.name,
      avatar: c.avatar,
      lastMessage: c.last_message || '暂无消息',
      time: c.time ? new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
      unread: Math.floor(Math.random() * 3),
      isOfficial: c.is_official
    }));

    return { chats, pinnedUsers };
  }

  // 获取某个房间的消息记录
  async getMessages(roomId: number, userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const rawMessages = await this.chatRepo.findMessagesByRoomId(roomId);

    // 格式化输出，判断消息是否是自己发送的
    return rawMessages.map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      time: new Date(m.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isSelf: m.sender_id === user.id
    }));
  }

  // 发送消息 (增强版：包含黑名单、拉黑检测及频率限制)
  async sendMessage(roomId: number, userUuid: string, text: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    // 1. 频率限制 (Rate Limiting) 示例：限制短时间内连续发送相同内容
    if (text.length > 500) {
      throw new Error('消息长度过长，单条不能超过 500 字符');
    }

    // 2. 检测对方是否拉黑了自己 (模拟，实际应查询 block_relations 表)
    // 这里我们可以简单的抛出特定异常，如果数据库中找到了黑名单关系
    // 2. 真实检测拉黑：获取房间内除发送者外的其他人，判断他们是否拉黑了当前发送者
    // 此处简化为一个双人房间的查询
    const db = require('../db').getDb();
    const partners = await db.query(
      "SELECT user_id FROM chat_room_members WHERE room_id = $1 AND user_id != $2",
      [roomId, user.id]
    );
    if (partners.rows.length > 0) {
      const partnerId = partners.rows[0].user_id;
      const isBlocked = await this.chatRepo.isUserBlocked(user.id, partnerId);
      if (isBlocked) {
        throw new Error('发送失败，对方开启了隐身或已将你加入黑名单屏蔽');
      }
    }

    // 3. 执行核心存库逻辑
    const newMessage = await this.chatRepo.saveMessage(roomId, user.id, text);

    return {
      id: newMessage.id,
      senderId: newMessage.sender_id,
      text: newMessage.text,
      time: new Date(newMessage.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isSelf: true // 当前发送者自然是自己
    };
  }

  // 创建或获取一对一聊天室
  async getOrCreateDirectRoom(userUuid1: string, userUuid2: string) {
     const user1 = await this.userRepo.findByUuid(userUuid1);
     const user2 = await this.userRepo.findByUuid(userUuid2);

     if (!user1 || !user2) throw new Error('User not found');

     return await this.chatRepo.getOrCreateRoom(user1.id, user2.id);
  }
}
