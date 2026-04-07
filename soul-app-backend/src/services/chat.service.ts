import { ChatRepository } from '../repositories/chat.repository';
import { UserRepository } from '../repositories/user.repository';

export class ChatService {
  private chatRepo = new ChatRepository();
  private userRepo = new UserRepository();

  async getChatList(userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const rawChats = await this.chatRepo.findChatListByUserId(user.id);

    // Format to match frontend ChatMessage DTO
    return rawChats.map((c: any) => ({
      id: c.room_id,
      name: c.name,
      avatar: c.avatar,
      lastMessage: c.last_message || '暂无消息',
      time: c.time ? new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
      unread: Math.floor(Math.random() * 3), // Still mocking unread count for now
      isOfficial: c.is_official
    }));
  }
}
