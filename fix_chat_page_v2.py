import re

with open('soul-app-web/src/pages/ChatPage.tsx', 'r') as f:
    content = f.read()

import_replacement = """
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ChatRoom from '../components/ChatRoom';
import type { ChatData } from '../components/SwipeableChatItem';
"""

# Replace imports
content = re.sub(r'import \{ useState \}.*?type \{ ChatData \} from \'../components/SwipeableChatItem\';', import_replacement, content, flags=re.DOTALL)

state_replacement = """
export default function ChatPage() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [pinnedUsers, setPinnedUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/chat')
      .then(res => res.json())
      .then(data => {
        setChats(data.chats || []);
        setPinnedUsers(data.pinnedUsers || []);
      })
      .catch(err => console.error("Failed to fetch chat data", err));
  }, []);
"""

content = re.sub(r'export default function ChatPage\(\) \{\n  const \[chats\] = useState<ChatData\[\]>\(initialChats\);\n  const \[activeChat, setActiveChat\] = useState<ChatData \| null>\(null\);', state_replacement, content)

with open('soul-app-web/src/pages/ChatPage.tsx', 'w') as f:
    f.write(content)
