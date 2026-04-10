const fs = require('fs');
const file = 'soul-app-backend/src/routes/admin.routes.ts';
let content = fs.readFileSync(file, 'utf8');

// 支持根据 userId 获取特定的 moment (admin/moments?userId=xx)
content = content.replace(
  `const status = (req.query.status as string) || 'active'; // 默认查询在架动态`,
  `const status = (req.query.status as string) || 'active'; // 默认查询在架动态
    const userIdStr = req.query.userId as string;
    const userId = userIdStr ? parseInt(userIdStr, 10) : undefined;

    const whereCondition: any = { status };
    if (userId) whereCondition.authorId = userId;`
);

content = content.replace(
  `const [total, moments] = await Promise.all([
      db.moment.count({ where: { status } }),
      db.moment.findMany({
        where: { status },`,
  `const [total, moments] = await Promise.all([
      db.moment.count({ where: whereCondition }),
      db.moment.findMany({
        where: whereCondition,`
);

fs.writeFileSync(file, content);
