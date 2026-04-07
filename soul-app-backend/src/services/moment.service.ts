import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class MomentService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  // 获取广场列表
  async getExploreMoments() {
    const rawMoments = await this.momentRepo.findAll();
    return rawMoments.map((m: any) => ({
      id: m.id,
      author: {
        id: m.user_id,
        name: m.authorName,
        avatar: m.authorAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + m.authorName + '&backgroundColor=b6e3f4'
      },
      text: m.text,
      image: m.image,
      type: m.type,
      time: new Date(m.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      initialLikes: m.initiallikes || m.initialLikes || 0,
      comments: Math.floor(Math.random() * 20) // 模拟评论数
    }));
  }

  async createMoment(userUuid: string, type: string, content: string | null, url: string | null) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    return await this.momentRepo.create(user.id, type, content, url);
  }

  async toggleLike(userUuid: string, momentId: number, isLike: boolean) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');
    if (isLike) {
      await this.momentRepo.likeMoment(user.id, momentId);
    } else {
      await this.momentRepo.unlikeMoment(user.id, momentId);
    }
    return { success: true };
  }
}
