const fs = require('fs');
const file = 'soul-app-web/src/pages/ChatPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The activeChat id is being passed to ChatRoom which expects a number.
// In the ChatResponse, the ID is likely a string or number. Let's make sure ChatRoom accepts string|number or cast it.
// Instead of editing ChatRoom, I'll update ChatData definition in ChatPage to be strictly 'id: string' (since backend IDs are UUIDs or strings).

content = content.replace(
  "export interface ChatData { id: number | string; name: string; avatar: string; lastMessage: string; time: string; unread: number; isOfficial?: boolean; }",
  "export interface ChatData { id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; isOfficial?: boolean; }"
);

fs.writeFileSync(file, content);

const file2 = 'soul-app-web/src/components/ChatRoom.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(
  "user: { id: number; name: string; avatar: string; isOnline?: boolean; isOfficial?: boolean };",
  "user: { id: string | number; name: string; avatar: string; isOnline?: boolean; isOfficial?: boolean };"
);
fs.writeFileSync(file2, content2);
