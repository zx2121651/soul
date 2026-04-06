const fs = require('fs');
const file = 'soul-app-web/src/pages/ChatPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The previous state of ChatPage already had SwipeableChatItem removed from the JSX (using a raw div instead).
// We just need to remove the unused import `import type { ChatData } from '../components/SwipeableChatItem';`
// and declare ChatData locally or from types.

content = content.replace(
  "import type { ChatData } from '../components/SwipeableChatItem';",
  "export interface ChatData { id: number | string; name: string; avatar: string; lastMessage: string; time: string; unread: number; isOfficial?: boolean; }"
);

fs.writeFileSync(file, content);
