import { getDb } from '../db';
import { Prisma } from '@prisma/client';

export class MomentRepository {
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
