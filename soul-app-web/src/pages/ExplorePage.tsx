
import { api } from '../api/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Play, Plus } from 'lucide-react';
import UserProfileModal from '../components/UserProfileModal';
import type { UserProfileData } from '../components/UserProfileModal';
import type { ExploreBanner, TrendingTopic, Post, ExploreResponse } from '../types';


interface LikeButtonProps {
  initialLikes: number;
}

const LikeButton = ({ initialLikes }: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); toggleLike(); }}
      whileTap={{ scale: 0.8 }}
      className="flex items-center gap-1 hover:text-pink-500 transition-colors"
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart size={16} className={liked ? "fill-pink-500 text-pink-500" : "text-gray-400"} />
      </motion.div>
      <span className={`text-[11px] font-medium ${liked ? 'text-pink-500' : 'text-gray-500'}`}>{likes}</span>
    </motion.button>
  );
};


export default function ExplorePage({ onOpenEditor }: { onOpenEditor?: () => void }) {
  const [activeTab, setActiveTab] = useState('推荐');
  const tabs = ['关注', '推荐', '最新'];
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);

  const [banners, setBanners] = useState<ExploreBanner[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api.get<ExploreResponse>('/explore').then(data => {
        setBanners(data.banners || []);
        setTrendingTopics(data.trendingTopics || []);
        setPosts(data.posts || []);
      })
      .catch(err => console.error("Failed to fetch explore data", err));
  }, []);


  const handleUserClick = (user: { name: string; avatar: string; isOnline?: boolean }) => {
    setSelectedUser({
      id: user.name,
      name: user.name,
      avatar: user.avatar,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: Math.floor(18 + Math.random() * 10),
      isOnline: user.isOnline
    });
  };

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col pt-12 pb-24">
      {/* Top Tabs */}
      <div className="flex justify-center items-center gap-6 px-4 pb-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-bold transition-colors relative pb-2 ${
              activeTab === tab ? 'text-white' : 'text-gray-400'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.span
                layoutId="exploreTabIndicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 shrink-0">
        <div className="bg-[#1c1e2b] rounded-full flex items-center px-4 py-2 gap-2 border border-white/5">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="搜索有趣的灵魂或瞬间"
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Banner Carousel */}
        <div className="px-4 pt-2 pb-4">
          <div className="flex overflow-x-auto gap-3 no-scrollbar snap-x snap-mandatory">
            {banners.map(banner => (
              <div key={banner.id} className={`snap-start shrink-0 w-64 h-24 rounded-2xl bg-gradient-to-r ${banner.bg} p-4 flex flex-col justify-center relative overflow-hidden shadow-lg`}>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-50">{banner.emoji}</div>
                <h3 className="text-white font-bold text-lg relative z-10">{banner.title}</h3>
                <button className="text-white/80 text-xs font-medium mt-1 w-fit bg-black/20 px-2 py-0.5 rounded-full relative z-10">
                  点击参与 &gt;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics Scroll */}
        <div className="px-4 mb-4">
          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
            {trendingTopics.map(topic => (
              <div key={topic.id} className="flex-shrink-0 flex items-center gap-1.5 bg-[#1c1e2b] px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap text-sm text-gray-300 shadow-sm cursor-pointer hover:bg-white/5">
                <span>{topic.icon}</span>
                <span className="font-medium">{topic.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Masonry Layout Grid */}
        <div className="px-3 pb-4 columns-2 gap-3 space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid bg-[#1c1e2b] rounded-2xl shadow-sm border border-white/5 overflow-hidden flex flex-col">

              {/* Cover Image or Voice Visualizer */}
              {post.type === 'image' && post.coverImage && (
                <div className="relative w-full aspect-[4/5] bg-gray-800">
                  <img src={post.coverImage} alt="cover" className="w-full h-full object-cover" />
                </div>
              )}
              {post.type === 'voice' && (
                <div className="w-full h-24 bg-gradient-to-tr from-[#2B404E] to-[#4A8F85] flex items-center justify-center relative overflow-hidden">
                   <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 hover:scale-105 transition-transform">
                     <Play size={18} fill="white" className="text-white ml-1" />
                   </button>
                   <div className="absolute inset-0 flex items-center justify-center opacity-30 gap-1">
                      {[...Array(10)].map((_,i) => (
                        <div key={i} className="w-1 bg-white rounded-full" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                      ))}
                   </div>
                   <span className="absolute bottom-2 right-2 text-white text-[10px] font-bold bg-black/30 px-1.5 rounded">{post.voiceDuration}s</span>
                </div>
              )}

              {/* Card Content */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-gray-200 text-xs mb-2 leading-relaxed line-clamp-3">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-cyan-400 text-[10px] font-bold bg-cyan-400/10 px-1.5 py-0.5 rounded">
                      {post.tags[0]}
                    </span>
                  </div>
                )}

                <div className="mt-auto pt-2 flex items-center justify-between">
                  <div
                    className="flex items-center gap-1.5 cursor-pointer"
                    onClick={() => handleUserClick(post.user)}
                  >
                    <img src={post.user.avatar} className="w-5 h-5 rounded-full bg-gray-700" alt="avatar" />
                    <span className="text-gray-400 text-[10px] truncate max-w-[50px] font-medium">{post.user.name}</span>
                  </div>
                  <LikeButton initialLikes={post.likes} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Posting */}
      <button
        onClick={onOpenEditor}
        className="absolute right-6 bottom-[100px] w-14 h-14 bg-gradient-to-tr from-[#8E5E99] to-[#C39BD3] rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(142,94,153,0.5)] z-40 active:scale-95 transition-transform"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
