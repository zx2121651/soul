const fs = require('fs');
const file = 'soul-app-web/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 导入新的多级路由页面
content = content.replace(
  `import MePage from './pages/MePage';`,
  `import MePage from './pages/MePage';\nimport MomentDetailPage from './pages/MomentDetailPage';\nimport UserProfilePage from './pages/UserProfilePage';\nimport EditProfilePage from './pages/EditProfilePage';`
);

// 注册新的 Route
content = content.replace(
  `<Route path="/me" element={<MePage onOpenEditor={() => setIsEditorOpen(true)} />} />`,
  `<Route path="/me" element={<MePage onOpenEditor={() => setIsEditorOpen(true)} />} />\n              <Route path="/moment/:id" element={<MomentDetailPage />} />\n              <Route path="/user/:id" element={<UserProfilePage />} />\n              <Route path="/edit-profile" element={<EditProfilePage />} />`
);

fs.writeFileSync(file, content);
