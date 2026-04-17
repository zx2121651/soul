import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class MomentService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  /**
   * =========================================================================
   * 【终极工业大厂级别】推荐系统进化版 (Ultimate Recommendation Engine with UCB & CTR)
   *
   * 核心重磅进化点:
   * 1. 深度画像 (Deep Profiling): 分析弱特征(点赞)与强特征(评论)，全方位洞察。
   * 2. U2U2I 协同过滤 (Collaborative Filtering): "猜你喜欢"，通过相似用户的共同点赞轨迹，召回高潜力动态。
   * 3. UCB 置信上限算法 (Upper Confidence Bound): 结合全站动态池浏览基数 `TOTAL_MOMENT_EXPOSURE` 和单篇内容的 `viewsCount`，
   *    引入了“探索与利用(Exploration & Exploitation)”，在保护优质爆文的同时，给予新发或未曝光内容合理的流量倾斜，打破马太效应。
   * 4. 真实 CTR 转化率预估 (Click-Through Rate): 不再只看绝对点赞数，而是基于 `likes / views`，严惩“标题党”或者“僵尸曝光贴”。
   * 5. 社交图谱提权与创作者权威度的深度交叉 (Social Graph + Math.log)。
   * 6. 基于滑动窗口的多样性隔离 (Sliding Window Anti-Boredom)。
   * 7. 后置聚合: 把曝光记录和 `viewsCount` 的累加扔进消息队列/异步事务 `recordBatchExposureWithCTR`。
   * =========================================================================
   */
  async getFeedRecommends(viewerUuid: string, pageSize: number = 10) {
    const viewer = await this.userRepo.findByUuid(viewerUuid);
    const viewerId = viewer ? viewer.id : 0;

    // 1. ================== 用户画像与社交图谱建模 (User Profiling & Graph) ==================
    const interestProfile = viewerId > 0 ? await this.momentRepo.getDeepUserInterestProfile(viewerId) : {};
    const followingIds = viewerId > 0 ? await this.momentRepo.getUserFollowingIds(viewerId) : [];
    const followingSet = new Set(followingIds);

    // 获取全系统曝光总盘，用于给 UCB 公式做探索基数
    const systemTotalViews = await this.momentRepo.getTotalExposureCount();

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

    // 3. ================== 终极三路合并召回 (Tri-Channel Candidates Recall) ==================
    const hotCandidates = await this.momentRepo.getGlobalHotCandidates(viewerId, viewedIds, blockedIds, 100);
    const freshCandidates = await this.momentRepo.getLatestFreshCandidates(viewerId, viewedIds, blockedIds, 100);
    const cfCandidates = viewerId > 0 ? await this.momentRepo.getCollaborativeFilteringCandidates(viewerId, viewedIds, blockedIds, 30) : [];

    const candidatesMap = new Map();
    // 后召回的覆盖前召回的，这里没区别，主要是利用 Map 主键去重
    hotCandidates.forEach((c: any) => candidatesMap.set(c.id, { ...c, _recallSource: 'HOT' }));
    freshCandidates.forEach((c: any) => candidatesMap.set(c.id, { ...c, _recallSource: 'FRESH' }));
    cfCandidates.forEach((c: any) => candidatesMap.set(c.id, { ...c, _recallSource: 'CF_U2U2I' }));

    const mergedCandidates = Array.from(candidatesMap.values());
    if (mergedCandidates.length === 0) return [];

    // 4. ================== 深度特征工程打分排序 (Deep Rank with CTR & UCB) ==================
    const now = new Date().getTime();

    let rankedCandidates = mergedCandidates.map((m: any) => {
      // 基础字段容错
      const views = m.viewsCount || 1;
      const likes = m.likesCount || 0;
      const comments = m._count.comments || 0;

      // 4.1 真实的点击/互动转化率预估 (CTR Prediction)
      // 如果一个帖子曝光了几千次才几个赞，那说明质量极差；曝光越少互动越多，说明潜力越猛
      const ctr = (likes * 1.5 + comments * 3) / views;
      // 用 log 处理点击率以平滑尖峰，但设定基础互动分底线
      const interactionScore = Math.max(1, Math.log2(ctr * 100 + 2)) * 10;

      // 4.2 UCB (Upper Confidence Bound) 探索得分：系统赋予新贴/冷门贴的潜力补偿
      // Math.sqrt(2 * ln(N) / n) 其中 N 为系统大盘总播放量，n 为此条动态累计曝光
      // 这个算法是业界标准的 Bandit 问题解法：曝光越少的越值得“探索探路”，曝光越多的“探索收益”越低
      const ucbExplorationScore = Math.sqrt(Math.log(systemTotalViews) / views) * 5;

      // 4.3 画像偏好个性加权
      let personalizedScore = 0;
      const mTags = m.tags.map((t: any) => t.tagName);
      for (const t of mTags) {
        if (interestProfile[t]) {
          personalizedScore += interestProfile[t] * 3;
        }
      }
      // 协同过滤召回的自带强相似属性，补底分
      if (m._recallSource === 'CF_U2U2I') personalizedScore += 15;

      // 4.4 创作者权威度加权
      const authorFollowers = m.author.followersCount || 0;
      const authorityScore = Math.log10(authorFollowers + 10) * 5;

      // 4.5 非线性时间衰减定律 (Time Decay)
      const hoursAgo = Math.max(0, (now - new Date(m.createdAt).getTime()) / (1000 * 60 * 60));
      // 大于 24 小时进行惩罚性断崖缩水
      const timeDecay = hoursAgo > 24 ? Math.pow(hoursAgo, 2.5) : Math.pow(hoursAgo + 1.5, 1.8);

      // 最终公式合并计算！
      let finalScore = (interactionScore + ucbExplorationScore + personalizedScore + authorityScore + 20) / timeDecay;

      // 4.6 社交熟人圈绝对霸权提升 (Social Graph Boost)
      if (followingSet.has(m.author.id)) {
        finalScore *= 2.0; // 提升为 2 倍
      }

      return {
        ...m,
        _score: finalScore,
        _details: {
          ctr: ctr.toFixed(3),
          ucb: ucbExplorationScore.toFixed(2),
          source: m._recallSource
        }
      };
    });

    rankedCandidates.sort((a, b) => b._score - a._score);

    // 5. ================== 滑动窗口打散隔离 (Sliding Window Diversity Re-Ranking) ==================
    let diversified = [];
    const recentAuthors: number[] = [];
    const recentTypes: string[] = [];
    let holdPool: any[] = [];

    const canAccept = (candidate: any) => {
      if (recentAuthors.slice(-2).includes(candidate.author.id)) return false;
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
        holdPool.push(candidate);
      }
      if (diversified.length >= pageSize) break;
    }

    while (diversified.length < pageSize && holdPool.length > 0) {
      diversified.push(holdPool.shift());
    }

    // 6. ================== 异步曝光更新事务 (Exposure CTR Update) ==================
    const exposedIds = diversified.map(d => d.id);
    if (viewerId > 0 && exposedIds.length > 0) {
      this.momentRepo.recordBatchExposureWithCTR(viewerId, exposedIds).catch((err: any) => console.warn('曝光打点事务失败', err.message));
    }

    return diversified.map(m => ({
      id: m.id,
      author: {
        id: m.author.id,
        name: m.author.name,
        avatar: m.author.avatar,
        bio: m.author.bio,
        followersCount: m.author.followersCount
      },
      text: m.content,
      image: m.url,
      type: m.type,
      tags: m.tags.map((t: any) => t.tagName),
      time: m.createdAt.toISOString(),
      initialLikes: m.likesCount,
      isLiked: m.likes && m.likes.length > 0,
      comments: m._count.comments,
      // 算法透明化透出，供极客用户观察引擎打分依据
      _algorithmScore: m._score.toFixed(2),
      _algorithmDetails: m._details,
      _isFollowedBoost: followingSet.has(m.author.id)
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

  /**
   * 获取指定用户的动态列表（游标分页）
   */
  async getUserMomentsWithPagination(userId: number, viewerId: number, limit: number = 10, cursor?: number) {
    const rawMoments = await this.momentRepo.findUserMomentsWithCursor(userId, viewerId, limit, cursor);

    let nextCursor: number | null = null;
    let moments = rawMoments;

    if (rawMoments.length > limit) {
      moments = rawMoments.slice(0, limit);
      nextCursor = moments[moments.length - 1].id;
    }

    const momentsDto = moments.map((m: any) => ({
      id: m.id,
      author: m.author,
      text: m.content,
      image: m.url,
      type: m.type,
      tags: m.tags.map((t: any) => t.tagName),
      time: m.createdAt.toISOString(),
      initialLikes: m._count.likes,
      isLiked: m.likes && m.likes.length > 0,
      comments: m._count.comments,
    }));

    return {
      moments: momentsDto,
      nextCursor
    };
  }
}
