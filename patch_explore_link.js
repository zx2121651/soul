const fs = require('fs');
const file = 'soul-app-web/src/pages/ExplorePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 在广场动态列表增加点击进入详情页的路由
content = content.replace(
  `<div key={post.id} className="bg-[#1c1e2b] rounded-2xl p-4 border border-white/5 relative overflow-hidden">`,
  `<div key={post.id} onClick={() => navigate(\`/moment/\${post.id}\`)} className="bg-[#1c1e2b] rounded-2xl p-4 border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">`
);

fs.writeFileSync(file, content);
