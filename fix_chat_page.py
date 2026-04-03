import re

with open('soul-app-web/src/pages/ChatPage.tsx', 'r') as f:
    content = f.read()

# Fix the earlier blind sed issues
content = content.replace('// };', '};')
content = content.replace('// // };', '};')

# properly comment out the functions if needed, or remove them
content = re.sub(r'const handleDelete = \(id: number\) => \{.*?\};', '', content, flags=re.DOTALL)
content = re.sub(r'const handleMarkRead = \(id: number\) => \{.*?\};', '', content, flags=re.DOTALL)

# Re-add normal bracket endings that were broken by global replace
content = content.replace('// const handleDelete = (id: number) => {', '')
content = content.replace('// const handleMarkRead = (id: number) => {', '')
content = content.replace('// setChats(chats.filter(chat => chat.id !== id));', '')
content = content.replace('// setChats(chats.map(chat => chat.id === id ? { ...chat, unread: 0 } : chat));', '')

with open('soul-app-web/src/pages/ChatPage.tsx', 'w') as f:
    f.write(content)
