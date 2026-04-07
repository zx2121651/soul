const fs = require('fs');
const file = 'soul-app-web/src/pages/ChatPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change ChatData back to string | number and we will just update ChatRoom component to accept string | number
content = content.replace(
  "export interface ChatData { id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; isOfficial?: boolean; }",
  "export interface ChatData { id: string | number; name: string; avatar: string; lastMessage: string; time: string; unread: number; isOfficial?: boolean; }"
);
fs.writeFileSync(file, content);
