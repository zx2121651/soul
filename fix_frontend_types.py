import glob

# 1. Update MePage
with open('soul-app-web/src/pages/MePage.tsx', 'r') as f:
    me_content = f.read()

me_content = me_content.replace("import type { UserProfileData } from '../components/UserProfileModal';", "import type { UserProfileData } from '../components/UserProfileModal';\nimport type { MeDataResponse } from '../types';")
me_content = me_content.replace("api.get<any>('/users/me')", "api.get<MeDataResponse>('/users/me')")
with open('soul-app-web/src/pages/MePage.tsx', 'w') as f: f.write(me_content)


# 2. Update ChatPage
with open('soul-app-web/src/pages/ChatPage.tsx', 'r') as f:
    chat_content = f.read()

chat_content = chat_content.replace("import type { ChatData } from '../components/SwipeableChatItem';", "import type { ChatData } from '../components/SwipeableChatItem';\nimport type { ChatMessage } from '../types';")
chat_content = chat_content.replace("api.get<any>('/chat')", "api.get<{ chats: ChatMessage[], pinnedUsers: any[] }>('/chat')")
with open('soul-app-web/src/pages/ChatPage.tsx', 'w') as f: f.write(chat_content)


# 3. Update ExplorePage
with open('soul-app-web/src/pages/ExplorePage.tsx', 'r') as f:
    explore_content = f.read()

explore_content = explore_content.replace("import type { UserProfileData } from '../components/UserProfileModal';", "import type { UserProfileData } from '../components/UserProfileModal';\nimport type { ExploreBanner } from '../types';")
explore_content = explore_content.replace("const [banners, setBanners] = useState<any[]>([]);", "const [banners, setBanners] = useState<ExploreBanner[]>([]);")
explore_content = explore_content.replace("api.get<any>('/explore')", "api.get<{ banners: ExploreBanner[], trendingTopics: any[], posts: any[] }>('/explore')")
with open('soul-app-web/src/pages/ExplorePage.tsx', 'w') as f: f.write(explore_content)
