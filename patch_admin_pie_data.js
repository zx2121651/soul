const fs = require('fs');
const file = 'soul-app-backend/src/routes/admin.routes.ts';
let content = fs.readFileSync(file, 'utf8');

// Add PieChart data (e.g. gender distribution or moment types)
content = content.replace(
  `// 添加图表用的趋势数据 (模拟最近7天)`,
  `// 饼图用的数据 (性别分布)
      genderData: [
        { name: '男生', value: 45 },
        { name: '女生', value: 55 }
      ],
      // 饼图用的数据 (瞬间动态类型分布)
      momentTypeData: [
        { name: '纯文字', value: 35 },
        { name: '图文', value: 50 },
        { name: '语音', value: 15 }
      ],
      // 添加图表用的趋势数据 (模拟最近7天)`
);

fs.writeFileSync(file, content);
