import { getDb } from '../db';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

export class UserRepository {
  async findByUsername(phone: string) {
    return await getDb().user.findUnique({ where: { phone } });
  }

  async findByPhone(phone: string) {
    return await getDb().user.findUnique({ where: { phone } });
  }

  async createSilentUser(phone: string) {
    const name = `居民_${crypto.randomInt(1000, 9999)}`;
    const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${phone}`;
    const uuid = crypto.randomUUID();
    return await getDb().user.create({
      data: {
        uuid,
        phone,
        name,
        avatar,
        passwordHash: 'silent_login_placeholder'
      }
    });
  }

  async createUser(uuid: string, name: string, phone: string, passwordHash: string, avatar?: string) {
    return await getDb().user.create({
      data: { uuid, phone, passwordHash, name, avatar }
    });
  }

  async findByUuid(uuid: string) {
    return await getDb().user.findUnique({ where: { uuid } });
  }

  // 聚合查询排行榜，根据粉丝数降序
  async getLeaderboard(limit = 10) {
    return await getDb().user.findMany({
      where: { status: 'active' },
      orderBy: { followersCount: 'desc' },
      take: limit,
      select: {
        id: true,
        uuid: true,
        name: true,
        avatar: true,
        bio: true,
        followersCount: true,
      }
    });
  }

  // 搜索用户
  async searchUsers(query: string, limit = 20) {
    return await getDb().user.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: query } },
          { bio: { contains: query } }
        ]
      },
      take: limit,
      select: { id: true, name: true, avatar: true, bio: true }
    });
  }

  /**
   * 生产级：使用 Prisma Transaction 实现关注操作
   */
  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) throw new Error('不能关注自己');

    const db = getDb();

    return await db.$transaction(async (tx) => {
      // 1. 检查是否已经关注
      const existing = await tx.userFollow.findUnique({
        where: { followerId_followingId: { followerId, followingId } }
      });
      if (existing) return; // 幂等性处理

      // 2. 创建关注记录
      await tx.userFollow.create({
        data: { followerId, followingId }
      });

      // 3. 更新双方计数（Prisma 的 increment 原子操作）
      await tx.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } }
      });
      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } }
      });
    });
  }

  /**
   * 生产级：使用 Prisma Transaction 实现取消关注操作
   */
  async unfollow(followerId: number, followingId: number) {
    const db = getDb();

    return await db.$transaction(async (tx) => {
      const existing = await tx.userFollow.findUnique({
        where: { followerId_followingId: { followerId, followingId } }
      });
      if (!existing) return;

      await tx.userFollow.delete({
        where: { followerId_followingId: { followerId, followingId } }
      });

      await tx.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } }
      });
      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } }
      });
    });
  }

  /**
   * 生产级：获取社交关系状态 (我关注TA，TA关注我，是否互关)
   */
  async getRelationship(viewerId: number, targetId: number) {
    const db = getDb();

    // 并发查询两笔关系
    const [iFollowYou, youFollowMe] = await Promise.all([
      db.userFollow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: targetId } } }),
      db.userFollow.findUnique({ where: { followerId_followingId: { followerId: targetId, followingId: viewerId } } })
    ]);

    const isFollowing = !!iFollowYou;
    const isFollowedBy = !!youFollowMe;

    return {
      isFollowing,
      isFollowedBy,
      isMutual: isFollowing && isFollowedBy
    };
  }
}
