import { ChatRepository } from '../repositories/chat.repository';
import { UserRepository } from '../repositories/user.repository';

export class ChatService {
  private chatRepo = new ChatRepository();
  private userRepo = new UserRepository();

  // 获取聊天列表
  async getChatList(userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const rawChats = await this.chatRepo.findChatListByUserId(user.id);

    // 格式化输出，符合前端期望的结构
    return rawChats.map((c: any) => ({
      id: c.room_id,
      name: c.name,
      avatar: c.avatar,
      lastMessage: c.last_message || '暂无消息',
      time: c.time ? new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
      unread: Math.floor(Math.random() * 3), // 目前仍然模拟未读消息数
      isOfficial: c.is_official
    }));
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

  // 发送消息
  async sendMessage(roomId: number, userUuid: string, text: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

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
