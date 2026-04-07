const fs = require('fs');
const file = 'soul-app-web/src/components/ChatRoom.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "export default function ChatRoom({ user, onBack }: { user: { id: number; name: string; avatar: string; isOnline?: boolean; isOfficial?: boolean }; onBack: () => void }) {",
  "export default function ChatRoom({ user, onBack }: { user: { id: string | number; name: string; avatar: string; isOnline?: boolean; isOfficial?: boolean }; onBack: () => void }) {"
);
fs.writeFileSync(file, content);
