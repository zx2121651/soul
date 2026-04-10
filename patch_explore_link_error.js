const fs = require('fs');
const file = 'soul-app-web/src/pages/ExplorePage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const handleUserClick = (user: any) => {
    if (user.id) {
      navigate(\`/user/\${user.id}\`);
    } else {
      console.warn('User ID missing for profile navigation');
    }
  };`,
  `// 确保有正确的用户点击事件
  const handleUserClick = (user: any) => {
    if (user && user.id) {
      navigate(\`/user/\${user.id}\`);
    } else {
      console.warn('缺少 User ID 无法进入主页');
    }
  };`
);

fs.writeFileSync(file, content);
