import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class MomentService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  // 获取广场列表（生产级：带有登录用户上下文的个性化展现）
  async getExploreMoments(viewerUuid: string) {
    const viewer = await this.userRepo.findByUuid(viewerUuid);
    const viewerId = viewer ? viewer.id : 0; // 支持未登录游客模式 (0 = 没点过赞)

    // 支持按游标拉取第一页 (20条)，实际可以开放参数
    const rawMoments = await this.momentRepo.findAllWithInteractions(viewerId, 20, 0);
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
      isLiked: m.isLikedByMe, // 返回当前用户是否已经点赞
      comments: Math.floor(Math.random() * 20) // 真实评论数需从 comments 表聚合
    }));
  }

  // 高级：创建动态（包含违禁词审查与话题标签提取）
  async createMoment(userUuid: string, type: string, content: string | null, url: string | null) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    // 1. 简单的风控审查：如果包含敏感词，抛出异常阻止发布
    const sensitiveWords = ['诈骗', '黄赌毒', '暴恐', '代刷', '加v'];
    if (content) {
      for (const word of sensitiveWords) {
        if (content.includes(word)) {
          throw new Error('内容包含敏感词汇，发布被拒绝');
        }
      }
    }

    // 2. 提取文本中的话题标签（例如：#寻找同频的灵魂）
    let tags: string[] = [];
    if (content) {
      const tagMatches = content.match(/#([^#\s]+)/g);
      if (tagMatches) {
        // 去重并去除 '#' 符号
        tags = Array.from(new Set(tagMatches.map(t => t.substring(1))));
      }
    }

    // 3. 执行数据库插入操作 (使用事物包装)
    const createdMoment = await this.momentRepo.createWithTransaction(user.id, type, content, url);

    // 4. (可选进阶) 将提取到的 tags 插入到话题表中，这里可以扩展为更新 trending topics
    if (tags.length > 0) {
      // console.log(`提取到了这些话题标签: ${tags.join(', ')}`);
      // 可以在此处调用 topicRepo 进行话题热度累加...
    }

    return createdMoment;
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
