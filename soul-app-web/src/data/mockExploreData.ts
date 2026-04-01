export type PostType = 'text' | 'image' | 'voice';

export interface ExplorePost {
  id: number;
  type: PostType;
  user: { name: string; avatar: string; isOnline: boolean };
  time: string;
  content: string;
  tags: string[];
  coverImage?: string;
  voiceDuration?: number;
  likes: number;
  comments: number;
  likers: string[];
  heightClass: string; // Used for Masonry layout simulation
}

export const mockPosts: ExplorePost[] = [
  {
    id: 1,
    type: 'image',
    user: { name: '一只小橘猫🐱', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf', isOnline: true },
    time: '刚刚',
    content: '今天的天气真好，适合出去散步~ 🌞',
    tags: ['#日常', '#好天气'],
    coverImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=600&fit=crop',
    likes: 12,
    comments: 3,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=1'],
    heightClass: 'h-[260px]'
  },
  {
    id: 2,
    type: 'voice',
    user: { name: '晚风', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=wind&backgroundColor=d4fc79', isOnline: false },
    time: '10分钟前',
    content: '录了一段吉他弹唱，有点紧张 🎸',
    tags: ['#音乐控', '#翻唱'],
    voiceDuration: 18,
    likes: 89,
    comments: 24,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'],
    heightClass: 'h-[160px]'
  },
  {
    id: 3,
    type: 'text',
    user: { name: '夏天🌿', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede', isOnline: true },
    time: '3小时前',
    content: '求推荐好听的独立音乐，最近严重歌荒了，大家帮帮忙呀...',
    tags: ['#独立音乐', '#歌荒求助'],
    likes: 8,
    comments: 20,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=6'],
    heightClass: 'h-[150px]'
  },
  {
    id: 4,
    type: 'image',
    user: { name: '半岛铁盒🌸', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=box&backgroundColor=ffd5dc', isOnline: false },
    time: '昨天',
    content: '周末去看了画展，感受到了色彩的魅力。',
    tags: ['#画展', '#周末碎片'],
    coverImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=300&fit=crop',
    likes: 128,
    comments: 15,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=7', 'https://api.dicebear.com/7.x/avataaars/svg?seed=8'],
    heightClass: 'h-[220px]'
  },
  {
    id: 5,
    type: 'image',
    user: { name: '陈子豪', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=chen&backgroundColor=b6e3f4', isOnline: true },
    time: '昨天',
    content: '又熬夜写代码了，跑通的瞬间很开心！💻✨',
    tags: ['#程序员', '#熬夜修仙'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=500&fit=crop',
    likes: 45,
    comments: 12,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=4'],
    heightClass: 'h-[240px]'
  },
  {
    id: 6,
    type: 'voice',
    user: { name: '冰美式☕', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=coffee&backgroundColor=ffd5dc', isOnline: true },
    time: '2天前',
    content: '分享一首睡前安眠曲，祝大家好梦 🌙',
    tags: ['#晚安', '#治愈系'],
    voiceDuration: 35,
    likes: 312,
    comments: 45,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=9', 'https://api.dicebear.com/7.x/avataaars/svg?seed=10'],
    heightClass: 'h-[160px]'
  }
];

export const trendingTopics = [
  { id: 1, name: '#MBTI性格', icon: '🔮' },
  { id: 2, name: '#今日穿搭', icon: '👗' },
  { id: 3, name: '#无语子瞬间', icon: '🙄' },
  { id: 4, name: '#干饭人', icon: '🍚' },
  { id: 5, name: '#治愈系', icon: '🩹' },
];

export const banners = [
  { id: 1, title: '群聊派对迎新季', bg: 'from-[#8E5E99] to-[#C39BD3]', emoji: '🎉' },
  { id: 2, title: 'MBTI 灵魂测试', bg: 'from-[#4A8F85] to-[#73C6B6]', emoji: '🧠' },
  { id: 3, title: '音乐同好交流会', bg: 'from-[#2B404E] to-[#537685]', emoji: '🎵' }
];
