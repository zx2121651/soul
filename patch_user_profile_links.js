const fs = require('fs');

// 更新 ExplorePage 上的头像点击，以及 ChatPage 等等，让它们跳到真实的 UserProfilePage
const exploreFile = 'soul-app-web/src/pages/ExplorePage.tsx';
let exploreContent = fs.readFileSync(exploreFile, 'utf8');

exploreContent = exploreContent.replace(
  `const handleUserClick = (user: { name: string; avatar: string; isOnline?: boolean }) => {
    setSelectedUser({
      id: user.name,
      name: user.name,
      avatar: user.avatar,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: Math.floor(18 + Math.random() * 10),
      isOnline: user.isOnline
    });
  };`,
  `const handleUserClick = (user: any) => {
    if (user.id) {
      navigate(\`/user/\${user.id}\`);
    } else {
      console.warn('User ID missing for profile navigation');
    }
  };`
);

// We need to make sure Explore posts pass the user ID correctly.
exploreContent = exploreContent.replace(
  `onClick={() => handleUserClick(post.author)}`,
  `onClick={(e) => { e.stopPropagation(); handleUserClick(post.author); }}`
);

fs.writeFileSync(exploreFile, exploreContent);

// 更新 PlanetPage 的点击
const planetFile = 'soul-app-web/src/pages/PlanetPage.tsx';
let planetContent = fs.readFileSync(planetFile, 'utf8');

planetContent = planetContent.replace(
  `const handleNodeClick = (node: NodeData) => {
    if (node.isSelf) return; // Optional: do not show modal for self

    // Transform NodeData to UserProfileData
    setSelectedUser({
      id: node.id,
      name: node.name,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + node.name + '&backgroundColor=b6e3f4', // mock avatar
      match: node.match,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: Math.floor(18 + Math.random() * 10),
      location: '银河系',
      isOnline: Math.random() > 0.3
    });
  };`,
  `const handleNodeClick = (node: NodeData) => {
    if (node.isSelf) return;
    // 直接跳转到他人主页
    window.location.href = \`/user/\${node.id}\`;
  };`
);

fs.writeFileSync(planetFile, planetContent);
