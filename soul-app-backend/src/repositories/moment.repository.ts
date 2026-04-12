import { getDb } from '../db';
import { Prisma } from '@prisma/client';

export class MomentRepository {

  /**
   * 工业级终极增强：多路召回通道之三 (U2U2I 协同过滤召回 / Collaborative Filtering)
   * 找到与当前用户“品味相似”的用户（他们点赞过相同的东西），
   * 然后推荐这些“相似用户”最近点赞过、但当前用户还没看过的动态。
   */
  async getCollaborativeFilteringCandidates(viewerId: number, viewedIds: number[], blockedIds: number[], poolSize: number = 30) {
    if (viewerId === 0) return [];
    const db = getDb();

    try {
      // 1. 找出我最近点赞过的动态 ID (最多 20 条，太多算不动)
      const myLikes = await db.momentLike.findMany({
        where: { userId: viewerId },
        select: { momentId: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      const myLikedMomentIds = myLikes.map(l => l.momentId);
      if (myLikedMomentIds.length === 0) return [];

      // 2. 找出同样点赞过这些动态的其他用户 (潜在相似品味的好友)，找出最活跃的 10 个人
      const similarUsersResult = await db.momentLike.groupBy({
        by: ['userId'],
        where: {
          momentId: { in: myLikedMomentIds },
          userId: { notIn: [viewerId, ...blockedIds] }
        },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      });
      const similarUserIds = similarUsersResult.map(s => s.userId);
      if (similarUserIds.length === 0) return [];

      // 3. 从这些“品味相似”的用户最近的点赞列表里，挑出我还没看过的动态作为推荐候选
      const cfLikes = await db.momentLike.findMany({
        where: {
          userId: { in: similarUserIds },
          momentId: { notIn: viewedIds } // 我没看过的
        },
        select: { momentId: true },
        orderBy: { createdAt: 'desc' },
        take: poolSize * 2
      });
      const cfMomentIds = Array.from(new Set(cfLikes.map(l => l.momentId))).slice(0, poolSize);

      if (cfMomentIds.length === 0) return [];

      // 4. 将这些动态的详细信息（带上作者、标签等）一并捞出
      return await db.moment.findMany({
        where: { id: { in: cfMomentIds }, status: 'active', authorId: { notIn: blockedIds } },
        include: {
          author: { select: { id: true, name: true, avatar: true, bio: true, followersCount: true } },
          tags: { select: { tagName: true } },
          likes: { where: { userId: viewerId }, select: { userId: true } },
          _count: { select: { comments: true } }
        }
      });
    } catch (e) {
      console.warn('协同过滤召回失败', e);
      return [];
    }
  }

  /**
   * 重构批量曝光记录：
   * 不仅向 UserMomentHistory 写入记录，还要同时利用 Prisma 事务更新每一条 Moment 的总曝光(viewsCount)
   * 并且更新全站流量盘 GlobalConfig (用于 UCB 探索置信区间计算)
   */
  async recordBatchExposureWithCTR(userId: number, momentIds: number[]) {
    if (!userId || momentIds.length === 0) return;
    const db = getDb();

    try {
      await db.$transaction(async (tx) => {
        // 1. 给每条动态的真实展现量 viewsCount 加 1
        await tx.moment.updateMany({
          where: { id: { in: momentIds } },
          data: { viewsCount: { increment: 1 } }
        });

        // 2. 插入个人排重记录，由于 SQLite 对并发支持薄弱，循环单条 try-catch 或者使用 upsert 模拟
        for (const mid of momentIds) {
          await tx.userMomentHistory.upsert({
            where: { userId_momentId_actionType: { userId, momentId: mid, actionType: 'view' } },
            update: {}, // 如果已存在什么都不做 (其实不会存在，因为之前过滤过)
            create: { userId, momentId: mid, actionType: 'view' }
          });
        }

        // 3. 更新全站总流量池，供 UCB 算法使用
        await tx.globalConfig.upsert({
          where: { key: 'TOTAL_MOMENT_EXPOSURE' },
          update: { value: { set: (parseInt(await tx.globalConfig.findUnique({where: {key: 'TOTAL_MOMENT_EXPOSURE'}}).then(c => c?.value || '0')) + momentIds.length).toString() } },
          create: { key: 'TOTAL_MOMENT_EXPOSURE', value: momentIds.length.toString() }
        });
      });
    } catch (e) {
      console.warn('记录批量曝光 (包含 viewsCount 累加) 出现冲突或失败', e);
    }
  }

  async getTotalExposureCount(): Promise<number> {
    try {
      const db = getDb();
      const config = await db.globalConfig.findUnique({ where: { key: 'TOTAL_MOMENT_EXPOSURE' } });
      return config ? parseInt(config.value, 10) : 1000; // 兜底 1000 次，避免分母爆零
    } catch (e) {
      return 1000;
    }
  }


  /**
   * 工业级增强：精准且深度的用户兴趣画像构建 (User Interest Profiling)
   * 采用基于行为加权的分析方式：用户的 "点赞" 记作弱特征(2分)，"评论" 记作强特征(5分)。
   */
  async getDeepUserInterestProfile(userId: number): Promise<Record<string, number>> {
    const db = getDb();

    // 1. 获取最近 100 条点赞的动态标签 (弱特征: Weight = 2)
    const likes = await db.momentLike.findMany({
      where: { userId },
      include: { moment: { include: { tags: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // 2. 获取最近 50 条评论过的动态标签 (强特征: Weight = 5)
    const comments = await db.momentComment.findMany({
      where: { authorId: userId },
      include: { moment: { include: { tags: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const tagScores: Record<string, number> = {};

    // 聚合点赞得分
    for (const like of likes) {
      if (like.moment && like.moment.tags) {
        for (const t of like.moment.tags) {
          tagScores[t.tagName] = (tagScores[t.tagName] || 0) + 2; // +2 兴趣分
        }
      }
    }

    // 聚合评论得分
    for (const comment of comments) {
      if (comment.moment && comment.moment.tags) {
        for (const t of comment.moment.tags) {
          tagScores[t.tagName] = (tagScores[t.tagName] || 0) + 5; // +5 兴趣分
        }
      }
    }

    return tagScores;
  }

  /**
   * 工业级增强：多路召回通道之二 (Global Hot Recall)
   * 获取全局高热度、未经当前用户曝光且不在黑名单中的动态
   */
  async getGlobalHotCandidates(viewerId: number, viewedIds: number[], blockedIds: number[], poolSize: number = 100) {
    const db = getDb();
    return await db.moment.findMany({
      where: {
        status: 'active',
        authorId: { notIn: [viewerId, ...blockedIds] },
        id: { notIn: viewedIds },
        // 只召回基础互动量大(例如点赞数 >= 5)的内容作为热门候选
        likesCount: { gte: 5 }
      },
      orderBy: { likesCount: 'desc' }, // 热度降序
      take: poolSize,
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true, followersCount: true } },
        tags: { select: { tagName: true } },
        likes: { where: { userId: viewerId }, select: { userId: true } },
        _count: { select: { comments: true } }
      }
    });
  }

  /**
   * 工业级增强：多路召回通道之一 (Latest Fresh Recall)
   * 获取最新发布的动态，保证推荐系统的内容有足够的新鲜度(Freshness)
   */
  async getLatestFreshCandidates(viewerId: number, viewedIds: number[], blockedIds: number[], poolSize: number = 100) {
    const db = getDb();
    return await db.moment.findMany({
      where: {
        status: 'active',
        authorId: { notIn: [viewerId, ...blockedIds] },
        id: { notIn: viewedIds }
      },
      orderBy: { createdAt: 'desc' }, // 时间降序
      take: poolSize,
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true, followersCount: true } }, // 必须带出粉丝数用于权威度计算
        tags: { select: { tagName: true } },
        likes: { where: { userId: viewerId }, select: { userId: true } },
        _count: { select: { comments: true } }
      }
    });
  }

  /**
   * 社交图谱提取：获取当前用户的关注列表，用于后续对熟人动态进行加权(Social Boost)
   */
  async getUserFollowingIds(userId: number): Promise<number[]> {
    if (!userId) return [];
    const db = getDb();
    const follows = await db.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    return follows.map(f => f.followingId);
  }


  /**
   * 生产级推荐系统 (推荐池召回)：
   * 从数据库中批量拉取近期的、且排除用户已看过、且排除被拉黑对象的候选动态集合
   */
  async getRecommendationCandidates(viewerId: number, poolSize: number = 200) {
    const db = getDb();

    // 如果是未登录游客 (viewerId=0)，则不进行历史排重，直接随机拉取热点
    if (!viewerId) {
      return await db.moment.findMany({
        where: { status: 'active' },
        orderBy: { likesCount: 'desc' },
        take: 50,
        include: { author: true, tags: true, _count: { select: { comments: true } } }
      });
    }

    // 对于真实用户：
    // 1. 查询该用户看过的 momentIds (历史排重池)
    const histories = await db.userMomentHistory.findMany({
      where: { userId: viewerId },
      select: { momentId: true }
    });
    const viewedIds = histories.map(h => h.momentId);

    // 2. 查询该用户拉黑的 blockerIds (社交隔离)
    const blocks = await db.userBlock.findMany({
      where: { blockerId: viewerId },
      select: { blockedId: true }
    });
    const blockedIds = blocks.map(b => b.blockedId);

    // 3. 复杂召回 (Recall): 获取不在黑名单、非自己发布、并且未曝光过的最新 200 条候选动态
    // (实际生产中这里可能是从 Redis 缓存的热榜队列或是 ElasticSearch 取数据，这里我们在关系型数据库模拟)
    const candidates = await db.moment.findMany({
      where: {
        status: 'active',
        authorId: { notIn: [viewerId, ...blockedIds] }, // 排除自己和拉黑对象
        id: { notIn: viewedIds } // 曝光排重机制
      },
      orderBy: { createdAt: 'desc' },
      take: poolSize,
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        tags: { select: { tagName: true } },
        likes: { where: { userId: viewerId }, select: { userId: true } }, // 用于判断是否已赞
        _count: { select: { comments: true } }
      }
    });

    return candidates;
  }



  /**
   * 获取用户的兴趣画像 (分析他点赞过、评论过的标签偏好)
   */
  async getUserInterestProfile(userId: number): Promise<Record<string, number>> {
    const db = getDb();

    // 找出他点赞过的所有的标签分布
    const likes = await db.momentLike.findMany({
      where: { userId },
      include: { moment: { include: { tags: true } } },
      take: 100 // 分析最近的 100 个赞
    });

    const tagScores: Record<string, number> = {};
    for (const like of likes) {
      if (like.moment && like.moment.tags) {
        for (const t of like.moment.tags) {
          tagScores[t.tagName] = (tagScores[t.tagName] || 0) + 1;
        }
      }
    }

    return tagScores;
  }

  /**
   * 生产级：基于 Cursor 的分页查询广场动态 (Prisma Include 与 聚合 COUNT)
   */
  async findAllWithInteractions(viewerId: number, limit: number = 20, lastId: number = 0) {
    const db = getDb();

    // 构建基于游标的查询参数
    const cursorObj = lastId > 0 ? { id: lastId } : undefined;
    const skipNum = lastId > 0 ? 1 : 0; // 如果传了 cursor，就要跳过 cursor 本身这条记录

    const moments = await db.moment.findMany({
      where: { status: 'active' },
      take: limit,
      cursor: cursorObj,
      skip: skipNum,
      orderBy: { id: 'desc' }, // 时间降序，也是 ID 降序
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        // 利用嵌套查询判断当前登陆用户是否点过赞
        likes: viewerId ? {
          where: { userId: viewerId },
          select: { userId: true }
        } : false,
        _count: {
          select: { comments: true }
        }
      }
    });

    // 格式化输出为业务层需要的数据结构
    return moments.map((m) => ({
      id: m.id,
      type: m.type,
      text: m.content,
      image: m.url,
      initialLikes: m.likesCount,
      time: m.createdAt,
      user_id: m.author.id,
      authorName: m.author.name,
      authorAvatar: m.author.avatar,
      comments: m._count.comments,
      isLikedByMe: m.likes && m.likes.length > 0 // 判断嵌套的点赞数组是否有记录
    }));
  }

  async findByUserId(userId: number, viewerId: number) {
    const db = getDb();
    const moments = await db.moment.findMany({
      where: { authorId: userId, status: 'active' },
      orderBy: { id: 'desc' },
      include: {
        likes: viewerId ? {
          where: { userId: viewerId },
          select: { userId: true }
        } : false,
        _count: {
          select: { comments: true }
        }
      }
    });

    return moments.map((m) => ({
      id: m.id,
      type: m.type,
      text: m.content,
      image: m.url,
      initialLikes: m.likesCount,
      time: m.createdAt,
      comments: m._count.comments,
      isLikedByMe: m.likes && m.likes.length > 0
    }));
  }

  /**
   * 生产级：使用 Prisma Transaction 创建动态并提取标签
   */
  async createWithTransaction(userId: number, type: string, content: string | null, url: string | null, tags: string[] = []) {
    const db = getDb();

    return await db.$transaction(async (tx) => {
      // 1. 创建动态本身
      const newMoment = await tx.moment.create({
        data: {
          authorId: userId,
          type,
          content,
          url,
          status: 'active'
        }
      });

      // 2. 如果有话题标签，进行批量插入/关联
      if (tags.length > 0) {
        const tagData = tags.map(t => ({
          momentId: newMoment.id,
          tagName: t
        }));
        for (const tag of tagData) {
          await tx.momentTag.create({ data: tag });
        }
      }

      return newMoment;
    });
  }

  /**
   * 生产级：乐观锁处理点赞 (使用 Prisma create 捕获冲突或 transaction)
   */
  async likeMoment(userId: number, momentId: number) {
    const db = getDb();

    try {
      await db.$transaction(async (tx) => {
        // 尝试创建关系
        await tx.momentLike.create({
          data: { userId, momentId }
        });

        // 关系建立成功后，冗余统计 +1
        await tx.moment.update({
          where: { id: momentId },
          data: { likesCount: { increment: 1 } }
        });
      });
      return true;
    } catch (e: any) {
      // Prisma 会在重复创建唯一约束记录时抛出 P2002 错误
      if (e.code === 'P2002') return false;
      throw e;
    }
  }

  async unlikeMoment(userId: number, momentId: number) {
    const db = getDb();

    try {
      await db.$transaction(async (tx) => {
        const existing = await tx.momentLike.findUnique({
          where: { userId_momentId: { userId, momentId } }
        });
        if (!existing) return;

        await tx.momentLike.delete({
          where: { userId_momentId: { userId, momentId } }
        });

        await tx.moment.update({
          where: { id: momentId },
          data: { likesCount: { decrement: 1 } }
        });
      });
      return true;
    } catch (e) {
      throw e;
    }
  }
}
