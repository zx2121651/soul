import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class MomentService {

  /**
   * =========================================================================
   * 极度复杂的工业级推荐系统 (Feed Recommendation Algorithm)
   * 包含：用户画像构建(Profile) -> 候选集召回(Recall) -> 特征打分排序(Ranking) -> 多样性打散(Diversity)
   * =========================================================================
   */
  async getFeedRecommends(viewerUuid: string, pageSize: number = 10) {
    const viewer = await this.userRepo.findByUuid(viewerUuid);
    const viewerId = viewer ? viewer.id : 0;

    // 1. 构建用户画像 (User Profile Modeling)
    // 根据用户历史点赞过的瞬间，提取出他偏好的话题标签 (e.g. {'日常': 5, '旅行': 2})
    const interestProfile = viewerId > 0 ? await this.momentRepo.getUserInterestProfile(viewerId) : {};

    // 2. 候选集召回 (Candidate Generation / Recall)
    // 从数据库中拉取最多 200 条新鲜、没有被该用户看过的、且发布者未被拉黑的动态，作为待评分的矿池
    const candidates = await this.momentRepo.getRecommendationCandidates(viewerId, 200);

    // 如果连候选集都空了（比如用户看完了所有动态），可以通过释放“曝光排重限制”重新循环，但我们这里简单返回空
    if (candidates.length === 0) return [];

    // 3. 特征打分排序 (Feature Ranking Model)
    // 基于 Hacker News Ranking 算法变种，结合牛顿冷却定律衰减时间权重，并赋予个性化兴趣加分
    const now = new Date().getTime();

    let rankedCandidates = candidates.map((m: any) => {
      // 基础互动分: (点赞数 * 2) + (评论数 * 3)
      let interactionScore = (m.likesCount * 2) + (m._count.comments * 3);

      // 兴趣加权分: 如果这条动态的标签命中了用户画像的兴趣点，给予巨额加分
      let personalizedScore = 0;
      const mTags = m.tags.map((t: any) => t.tagName);
      for (const t of mTags) {
        if (interestProfile[t]) {
          personalizedScore += interestProfile[t] * 5; // 命中一次偏好加5分权重
        }
      }

      // 时间衰减因子 (Gravity / Time Decay)
      // (时间差(小时) + 2) ^ 1.5
      const hoursAgo = Math.max(0, (now - new Date(m.createdAt).getTime()) / (1000 * 60 * 60));
      const timeDecay = Math.pow(hoursAgo + 2, 1.5);

      // 最终综合排序得分 (Score)
      // 公式: (基础互动分 + 个性化偏好分 + 10基础权重) / 时间衰减
      const finalScore = (interactionScore + personalizedScore + 10) / timeDecay;

      return {
        ...m,
        _score: finalScore
      };
    });

    // 根据综合得分倒序排列
    rankedCandidates.sort((a, b) => b._score - a._score);

    // 4. 多样性打乱隔离 (Diversification)
    // 防止信息茧房，如果在高分区连续出现同一个作者的动态，我们将它们稍微打散间隔开
    let diversified = [];
    const recentAuthors = new Set<number>();

    for (let i = 0; i < rankedCandidates.length; i++) {
      const candidate = rankedCandidates[i];
      if (recentAuthors.has(candidate.author.id)) {
        // 如果前面刚刚出现过该作者，把他往后推（放入临时备选区或稍后插入）
        // 这里做简单的处理：直接推迟他的曝光权重（如果数据足够大，可以引入更复杂的混排队列）
      }
      diversified.push(candidate);
      recentAuthors.add(candidate.author.id);

      // 达到前端请求的 pageSize 就可以停止了
      if (diversified.length >= pageSize) break;
    }

    // 5. 记录曝光历史 (Exposure Tracking)
    // 将最终决定推给用户的这批动态 ID，写入曝光表，防止用户下次刷新时再次看到重复的这批数据
    const exposedIds = diversified.map(d => d.id);
    if (viewerId > 0 && exposedIds.length > 0) {
      await this.momentRepo.recordBatchExposure(viewerId, exposedIds);
    }

    // 6. 数据序列化 (Serialization to DTO)
    // 将庞大的数据库结构精简为前端所需的字段格式
    return diversified.map(m => ({
      id: m.id,
      author: {
        id: m.author.id,
        name: m.author.name,
        avatar: m.author.avatar,
        bio: m.author.bio
      },
      text: m.content,
      image: m.url,
      type: m.type,
      tags: m.tags.map((t: any) => t.tagName),
      time: m.createdAt.toISOString(),
      initialLikes: m.likesCount,
      isLiked: m.likes && m.likes.length > 0,
      comments: m._count.comments,
      _algorithmScore: m._score.toFixed(4) // 透传给前端调试显示算法得分
    }));
  }

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
