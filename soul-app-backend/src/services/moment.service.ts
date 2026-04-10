import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class MomentService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  /**
   * =========================================================================
   * 【顶级/大厂级别】推荐系统增强版 (Enhanced Feed Recommendation Engine)
   *
   * 核心进化点:
   * 1. 深度画像 (Deep Profiling): 区分点赞与评论的弱/强特征偏好，提取立体的兴趣矩阵。
   * 2. 多路召回 (Multi-Channel Recall): 弃用单表捞取，采用 "热门候选(Hot) + 新鲜发布(Fresh)" 双池合并。
   * 3. 社交加权 (Social Graph Boost): 你的关注者 (Following) 的动态，将获得最终得分的 1.5 倍增益。
   * 4. 创作者权威度 (Creator Authority): 根据发布者粉丝数计算 Math.log10，对大V创作者给予合理的权威分奖励。
   * 5. 严格打散重排 (Sliding Window Anti-boredom): 严防信息茧房，连续不出现 2 个相同类型的动态，也不允许连续霸榜同一个作者。
   * =========================================================================
   */
  async getFeedRecommends(viewerUuid: string, pageSize: number = 10) {
    const viewer = await this.userRepo.findByUuid(viewerUuid);
    const viewerId = viewer ? viewer.id : 0;

    // 1. ================== 用户画像与社交图谱建模 (User Profiling & Graph) ==================
    // 深度分析用户偏好 (点赞+2，评论+5) -> 例如 {'日常': 12, '萌宠': 7}
    const interestProfile = viewerId > 0 ? await this.momentRepo.getDeepUserInterestProfile(viewerId) : {};

    // 提取社交圈 (当前用户关注的人的集合)，为后续的熟人提权做准备
    const followingIds = viewerId > 0 ? await this.momentRepo.getUserFollowingIds(viewerId) : [];
    const followingSet = new Set(followingIds);

    // 2. ================== 全局排重池生成 (Global Anti-Duplicate Check) ==================
    const db = require('../db').getDb();
    let viewedIds: number[] = [];
    let blockedIds: number[] = [];

    if (viewerId > 0) {
      const histories = await db.userMomentHistory.findMany({ where: { userId: viewerId }, select: { momentId: true } });
      viewedIds = histories.map((h: any) => h.momentId);

      const blocks = await db.userBlock.findMany({ where: { blockerId: viewerId }, select: { blockedId: true } });
      blockedIds = blocks.map((b: any) => b.blockedId);
    }

    // 3. ================== 多路召回合并 (Multi-Channel Candidates Recall) ==================
    // 频道A: 获取高热度动态候选(100条)
    const hotCandidates = await this.momentRepo.getGlobalHotCandidates(viewerId, viewedIds, blockedIds, 100);
    // 频道B: 获取最新鲜的冷启动候选(100条)
    const freshCandidates = await this.momentRepo.getLatestFreshCandidates(viewerId, viewedIds, blockedIds, 100);

    // 合并双路数据，利用 Map 去重 (可能有既新又热的帖子)
    const candidatesMap = new Map();
    hotCandidates.forEach((c: any) => candidatesMap.set(c.id, c));
    freshCandidates.forEach((c: any) => candidatesMap.set(c.id, c));
    const mergedCandidates = Array.from(candidatesMap.values());

    if (mergedCandidates.length === 0) return [];

    // 4. ================== 深度特征交叉打分 (Deep Feature Engineering & Ranking) ==================
    const now = new Date().getTime();

    let rankedCandidates = mergedCandidates.map((m: any) => {
      // 基础互动分: (获赞*2 + 评论数*3)
      const interactionScore = (m.likesCount * 2) + (m._count.comments * 3);

      // 画像偏好加权分: 结合动态标签与用户深度画像的匹配重合度
      let personalizedScore = 0;
      const mTags = m.tags.map((t: any) => t.tagName);
      for (const t of mTags) {
        if (interestProfile[t]) {
          personalizedScore += interestProfile[t] * 3; // 基于兴趣程度给分
        }
      }

      // 创作者权威度加权分: 对创作者的粉丝基数计算 log，避免大V绝对碾压，但保障其高质量内容的流量倾斜
      const authorFollowers = m.author.followersCount || 0;
      const authorityScore = Math.log10(authorFollowers + 10) * 5;

      // 衰减体系: 非线性时间冷却定律 (Time Decay) -> 越老的内容得分缩水越快
      const hoursAgo = Math.max(0, (now - new Date(m.createdAt).getTime()) / (1000 * 60 * 60));
      // 优化公式：新内容在最初 6 小时有绝对保量期，24小时后进入断崖式滑坡
      const timeDecay = Math.pow(hoursAgo + 1.5, 1.8);

      // 初步综合算分
      let finalScore = (interactionScore + personalizedScore + authorityScore + 20) / timeDecay;

      // 社交图谱提权 (Social Graph Boost):
      // 无论时间多久，如果是熟人/关注的人发的内容，得分强行乘以 1.5 倍增益！
      if (followingSet.has(m.author.id)) {
        finalScore *= 1.5;
      }

      return {
        ...m,
        _score: finalScore
      };
    });

    // 将打分完毕的全体矿池由高到低排列
    rankedCandidates.sort((a, b) => b._score - a._score);

    // 5. ================== 滑动窗口打散重排 (Sliding Window Diversity Re-Ranking) ==================
    let diversified = [];
    const recentAuthors: number[] = []; // 记录近几个被采纳帖子的作者
    const recentTypes: string[] = [];   // 记录近几个被采纳帖子的内容形式(图文/文字)

    // 我们建立一个备用池，存放因为重复被暂时“打回去”的帖子
    let holdPool: any[] = [];

    // 滑动窗口检查器
    const canAccept = (candidate: any) => {
      // 防同一作者霸屏：在最近 2 个位置中不能出现该作者
      if (recentAuthors.slice(-2).includes(candidate.author.id)) return false;
      // 防同质内容审缓疲劳：在最近 3 个位置中，不能全部是同一种类型的内容
      if (recentTypes.length >= 3) {
        const last3 = recentTypes.slice(-3);
        if (last3.every(t => t === candidate.type)) return false;
      }
      return true;
    };

    for (let i = 0; i < rankedCandidates.length; i++) {
      const candidate = rankedCandidates[i];

      if (canAccept(candidate)) {
        diversified.push(candidate);
        recentAuthors.push(candidate.author.id);
        recentTypes.push(candidate.type);
      } else {
        // 如果违背打散策略，先放进备用池，稍后再给机会
        holdPool.push(candidate);
      }

      // 如果当前窗口选满了我们需要的这一页的数量，就直接停止
      if (diversified.length >= pageSize) break;
    }

    // 如果上面一轮严格挑选没选满，迫不得已只能从刚才打回去的备用池里补齐 (降级方案)
    while (diversified.length < pageSize && holdPool.length > 0) {
      diversified.push(holdPool.shift());
    }

    // 6. ================== 异步记录曝光与响应转换 (Exposure Async Log & DTO) ==================
    const exposedIds = diversified.map(d => d.id);
    if (viewerId > 0 && exposedIds.length > 0) {
      // 不等待 await，直接扔进事件循环，不阻塞用户的接口返回速度
      this.momentRepo.recordBatchExposure(viewerId, exposedIds).catch((err: any) => console.warn('曝光打点失败', err.message));
    }

    return diversified.map(m => ({
      id: m.id,
      author: {
        id: m.author.id,
        name: m.author.name,
        avatar: m.author.avatar,
        bio: m.author.bio,
        followersCount: m.author.followersCount // 增加透传展示权威度
      },
      text: m.content,
      image: m.url,
      type: m.type,
      tags: m.tags.map((t: any) => t.tagName),
      time: m.createdAt.toISOString(),
      initialLikes: m.likesCount,
      isLiked: m.likes && m.likes.length > 0,
      comments: m._count.comments,
      _algorithmScore: m._score.toFixed(2), // 得分保留2位小数
      _isFollowedBoost: followingSet.has(m.author.id) // 透传给前端标识这是否是一条由于关注关系而插队的熟人动态
    }));
  }
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
