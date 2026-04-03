import re

with open('soul-app-web/src/pages/ChatPage.tsx', 'r') as f:
    content = f.read()

import_replacement = """
import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Check, CheckCircle2 } from 'lucide-react';
// import SwipeableChatItem from '../components/SwipeableChatItem';
"""

content = re.sub(r'import \{ useState \}.*?SwipeableChatItem\';', import_replacement, content, flags=re.DOTALL)


state_replacement = """
export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'messages'|'match'>('messages');
  const [chats, setChats] = useState<any[]>([]);
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

content = re.sub(r'export default function ChatPage\(\) \{\n  const \[activeTab, setActiveTab\] = useState<\'messages\'\|\'match\'>\(\'messages\'\);\n  const \[chats\] = useState\(\[\n[\s\S]*?\]\);', state_replacement, content)
content = re.sub(r'const pinnedUsers = \[[\s\S]*?\];', '', content)


with open('soul-app-web/src/pages/ChatPage.tsx', 'w') as f:
    f.write(content)
