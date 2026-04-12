const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'soul-app-backend', 'src', 'routes', 'user.routes.ts');
let code = fs.readFileSync(file, 'utf-8');

// We need to add the block API to user routes
if (!code.includes("router.post('/:id/block'")) {
  const insertIndex = code.indexOf('export default router;');
  const newRoute = `
// ==================== 拉黑用户 (Block User) ====================
router.post('/:id/block', authMiddleware, async (req, res, next) => {
  try {
    const db = require('../db').getDb();
    const targetId = parseInt(req.params.id as string, 10);
    const userUuid = req.user?.uuid || 'soul_123456';

    const viewer = await db.user.findUnique({ where: { uuid: userUuid } });
    if (!viewer) return sendError(res, 401, '当前登录已失效');

    if (viewer.id === targetId) return sendError(res, 400, '不能拉黑自己');

    const targetUser = await db.user.findUnique({ where: { id: targetId } });
    if (!targetUser) return sendError(res, 404, '该用户不存在');

    // 使用事务保证拉黑的同时，解除双向关注关系
    await db.$transaction(async (tx: any) => {
      // 1. 插入拉黑记录 (使用 upsert 避免重复拉黑报错)
      await tx.userBlock.upsert({
        where: { blockerId_blockedId: { blockerId: viewer.id, blockedId: targetId } },
        update: {},
        create: { blockerId: viewer.id, blockedId: targetId }
      });

      // 2. 解除 我关注他
      const follow1 = await tx.userFollow.findUnique({ where: { followerId_followingId: { followerId: viewer.id, followingId: targetId } } });
      if (follow1) {
        await tx.userFollow.delete({ where: { followerId_followingId: { followerId: viewer.id, followingId: targetId } } });
        await tx.user.update({ where: { id: viewer.id }, data: { followingCount: { decrement: 1 } } });
        await tx.user.update({ where: { id: targetId }, data: { followersCount: { decrement: 1 } } });
      }

      // 3. 解除 他关注我
      const follow2 = await tx.userFollow.findUnique({ where: { followerId_followingId: { followerId: targetId, followingId: viewer.id } } });
      if (follow2) {
        await tx.userFollow.delete({ where: { followerId_followingId: { followerId: targetId, followingId: viewer.id } } });
        await tx.user.update({ where: { id: targetId }, data: { followingCount: { decrement: 1 } } });
        await tx.user.update({ where: { id: viewer.id }, data: { followersCount: { decrement: 1 } } });
      }
    });

    sendSuccess(res, null, '已拉黑该用户');
  } catch (err) {
    next(err);
  }
});

`;
  code = code.substring(0, insertIndex) + newRoute + code.substring(insertIndex);
  fs.writeFileSync(file, code);
  console.log('User block route added');
} else {
  console.log('User block route already exists');
}
