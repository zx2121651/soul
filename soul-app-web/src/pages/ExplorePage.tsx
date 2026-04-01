
import { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';




const mockPosts = [
  {
    id: 1,
    user: { name: '一只小橘猫🐱', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf' },
    time: '刚刚',
    content: '今天的天气真好，适合出去散步~ 🌞',
    tags: ['#日常', '#好天气'],
    images: ['https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop'],
    likes: 12,
    comments: 3,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2']
  },
  {
    id: 2,
    user: { name: '陈子豪', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=chen&backgroundColor=b6e3f4' },
    time: '1小时前',
    content: '又熬夜写代码了，这已经是这个月的第三次了。不过看到跑通的瞬间还是很开心的！💻✨',
    tags: ['#程序员', '#熬夜修仙'],
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop'
    ],
    likes: 45,
    comments: 12,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', 'https://api.dicebear.com/7.x/avataaars/svg?seed=5']
  },
  {
    id: 3,
    user: { name: '夏天🌿', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede' },
    time: '3小时前',
    content: '求推荐好听的独立音乐，最近歌荒了...',
    tags: ['#独立音乐', '#歌荒求助'],
    images: [],
    likes: 8,
    comments: 20,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=6']
  },
  {
    id: 4,
    user: { name: '半岛铁盒🌸', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=box&backgroundColor=ffd5dc' },
    time: '昨天',
    content: '周末去看了画展，虽然不太懂艺术，但是感受到了色彩的魅力。',
    tags: ['#画展', '#周末碎片'],
    images: [
      'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&h=300&fit=crop'
    ],
    likes: 128,
    comments: 15,
    likers: ['https://api.dicebear.com/7.x/avataaars/svg?seed=7', 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', 'https://api.dicebear.com/7.x/avataaars/svg?seed=9', 'https://api.dicebear.com/7.x/avataaars/svg?seed=10']
  }
];

const trendingTopics = [
  { id: 1, name: '#MBTI性格', icon: '🔮' },
  { id: 2, name: '#今日穿搭', icon: '👗' },
  { id: 3, name: '#无语子瞬间', icon: '🙄' },
  { id: 4, name: '#干饭人', icon: '🍚' },
  { id: 5, name: '#治愈系', icon: '🩹' },
];



export default function ExplorePage({ onOpenEditor }: { onOpenEditor?: () => void }) {
  const [activeTab, setActiveTab] = useState('推荐');
  const tabs = ['关注', '推荐', '最新'];




  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col pt-12 pb-24">
      {/* Top Tabs */}
      <div className="flex justify-center items-center gap-6 px-4 pb-4 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-medium transition-colors relative ${
              activeTab === tab ? 'text-white' : 'text-gray-400'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Feed List */}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Trending Topics Scroll */}
        <div className="px-4 mb-4">
          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
            {trendingTopics.map(topic => (
              <div key={topic.id} className="flex-shrink-0 flex items-center gap-1.5 bg-[#1c1e2b] px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap text-sm text-gray-300">
                <span>{topic.icon}</span>
                <span>{topic.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="px-4 space-y-4 pb-4">
          {mockPosts.map((post) => (
            <div key={post.id} className="bg-[#1c1e2b] rounded-2xl p-4 shadow-sm border border-white/5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative cursor-pointer" onClick={() => handleUserClick(post.user)}>
                    <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                    {/* Tiny online dot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#1c1e2b] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">{post.user.name}</h4>
                    <p className="text-gray-500 text-xs">{post.time}</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-300">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Content */}
              <p className="text-gray-200 text-sm mb-2 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="text-cyan-400 text-xs font-medium bg-cyan-400/10 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Multi-Image Grid */}
              {post.images.length > 0 && (
                <div className={`mb-3 grid gap-1 rounded-xl overflow-hidden ${
                  post.images.length === 1 ? 'grid-cols-1 max-h-48' :
                  post.images.length === 2 ? 'grid-cols-2 aspect-[2/1]' :
                  'grid-cols-3 aspect-square'
                }`}>
                  {post.images.map((img, idx) => (
                    <img key={idx} src={img} alt="post media" className="w-full h-full object-cover" />
                  ))}
                </div>
              )}

              {/* Actions & Likers */}
              <div className="flex justify-between items-center text-gray-400 mt-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                   {/* Likers Stack */}
                   {post.likers.length > 0 && (
                     <div className="flex -space-x-2 mr-2">
                       {post.likers.slice(0,3).map((avatar, idx) => (
                         <img key={idx} src={avatar} className="w-5 h-5 rounded-full border border-[#1c1e2b] bg-gray-700" alt="liker" />
                       ))}
                     </div>
                   )}
                   <span className="text-xs text-gray-500">{post.likes} 赞</span>
                </div>

                <div className="flex gap-5">
                  <button className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                    <Heart size={18} />
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                    <MessageSquare size={18} />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="hover:text-cyan-400 transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
