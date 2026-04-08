const fs = require('fs');
const file = 'soul-app-admin/src/pages/Banners.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "await api.delete(\\`/admin/banners/\\${id}\\`);",
  "await api.delete(`/admin/banners/${id}`);"
);

fs.writeFileSync(file, content);
