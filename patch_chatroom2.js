const fs = require('fs');
const file = 'soul-app-web/src/components/ChatRoom.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "id: number;",
  "id: number | string;"
);

fs.writeFileSync(file, content);
