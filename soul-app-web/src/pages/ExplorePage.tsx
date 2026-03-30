import { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';

const mockPosts = [
  {
    id: 1,
    user: { name: '一只小橘猫', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf' },
    time: '刚刚',
    content: '今天的天气真好，适合出去散步~ 🌞',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop',
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    user: { name: '陈子豪', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=chen&backgroundColor=b6e3f4' },
    time: '1小时前',
    content: '又熬夜写代码了，这已经是这个月的第三次了。不过看到跑通的瞬间还是很开心的！💻✨',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    likes: 45,
    comments: 12,
  },
  {
    id: 3,
    user: { name: '夏天', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede' },
    time: '3小时前',
    content: '求推荐好听的独立音乐，最近歌荒了...',
    image: null,
    likes: 8,
    comments: 20,
  },
  {
    id: 4,
    user: { name: '半岛铁盒', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=box&backgroundColor=ffd5dc' },
    time: '昨天',
    content: '周末去看了画展，虽然不太懂艺术，但是感受到了色彩的魅力。',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=300&fit=crop',
    likes: 128,
    comments: 15,
  }
];

export default function ExplorePage() {
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
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4">
        {mockPosts.map((post) => (
          <div key={post.id} className="bg-[#1c1e2b] rounded-2xl p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-gray-800" />
                <div>
                  <h4 className="text-white text-sm font-bold">{post.user.name}</h4>
                  <p className="text-gray-400 text-xs">{post.time}</p>
                </div>
              </div>
              <button className="text-gray-400">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-200 text-sm mb-3 leading-relaxed">
              {post.content}
            </p>

            {/* Image (if any) */}
            {post.image && (
              <div className="mb-3 rounded-xl overflow-hidden max-h-48">
                <img src={post.image} alt="post media" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center text-gray-400 mt-2">
              <div className="flex gap-6">
                <button className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                  <Heart size={18} />
                  <span className="text-xs">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                  <MessageSquare size={18} />
                  <span className="text-xs">{post.comments}</span>
                </button>
              </div>
              <button className="hover:text-cyan-400 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
