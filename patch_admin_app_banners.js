const fs = require('fs');
const file = 'soul-app-admin/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `import Announcements from './pages/Announcements';`,
  `import Announcements from './pages/Announcements';\nimport Banners from './pages/Banners';`
);

content = content.replace(
  `<Route path="announcements" element={<Announcements />} />`,
  `<Route path="announcements" element={<Announcements />} />\n            <Route path="banners" element={<Banners />} />`
);

fs.writeFileSync(file, content);

const layoutFile = 'soul-app-admin/src/layout/MainLayout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

layoutContent = layoutContent.replace(
  `NotificationOutlined,`,
  `NotificationOutlined,\n  PictureOutlined,`
);

layoutContent = layoutContent.replace(
  `{ key: '/announcements', icon: <NotificationOutlined />, label: '系统广播' },`,
  `{ key: '/announcements', icon: <NotificationOutlined />, label: '系统广播' },\n            { key: '/banners', icon: <PictureOutlined />, label: '广场海报' },`
);

fs.writeFileSync(layoutFile, layoutContent);
