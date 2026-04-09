import { api } from '../api/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Play, Plus, Headphones } from 'lucide-react';
import UserProfileModal from '../components/UserProfileModal';
import type { UserProfileData } from '../components/UserProfileModal';
import type { ExploreBanner, TrendingTopic, Post, ExploreResponse, VoiceRoom } from '../types';

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
        <Heart size={20} fill={liked ? "currentColor" : "none"} className={liked ? "text-pink-500" : "text-gray-400"} />
      </motion.div>
      <span className={`text-sm ${liked ? "text-pink-500" : "text-gray-400"}`}>{likes}</span>
    </motion.button>
  );
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('推荐');
  const tabs = ['关注', '推荐', '最新'];
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);

  const [banners, setBanners] = useState<ExploreBanner[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');

  useEffect(() => {
    // 从真实的 moments 路由获取广场数据，附带中文注释
    api.get<{explore: ExploreResponse}>('/moments')
      .then(data => {
        if (data.explore) {
          setBanners(data.explore.banners || []);
          setTrendingTopics(data.explore.trendingTopics || []);
          setPosts(data.explore.posts || []);
        }
      })
      .catch(err => console.error("获取广场动态失败", err));

    // 获取真实的语音房列表，支持后端下发
    api.get<{ rooms: VoiceRoom[] }>('/voicerooms')
      .then(data => setVoiceRooms(data.rooms || []))
      .catch(err => console.error("获取异星派对(语音房)失败", err));
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

  const handleCreateVoiceRoom = async () => {
    if (!newRoomTitle.trim()) return;
    try {
      const res = await api.post<{ roomId: string }>('/voicerooms', { title: newRoomTitle, tags: ['派对'] });
      setIsCreatingRoom(false);
      // 跳转到真实的语音房页面
      navigate(`/voiceroom/${res.roomId}`);
    } catch (err) {
      console.error('创建语音房失败', err);
    }
  };

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col pt-12 pb-24 overflow-y-auto no-scrollbar relative">
      {/* Top Tabs */}
      <div className="flex justify-center items-center gap-6 px-4 pb-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg transition-colors relative ${activeTab === tab ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="exploreTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}
        <button className="absolute right-4 text-gray-300">
          <Search size={22} />
        </button>
      </div>

      {/* Banners */}
      <div className="mt-4 px-4 flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {banners.map(banner => (
          <div
            key={banner.id}
            onClick={() => navigate(`/voiceroom/room_${banner.id}`)}
            style={{ cursor: "pointer" }}
            className={`min-w-[280px] h-[120px] rounded-2xl bg-gradient-to-r ${banner.bg} p-4 flex flex-col justify-end relative overflow-hidden`}
          >
            <span className="text-4xl absolute -right-2 top-2 opacity-50">{banner.emoji}</span>
            <h3 className="text-white font-bold text-xl relative z-10">{banner.title}</h3>
            <button className="w-fit mt-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center gap-1">
              <Play size={12} fill="currentColor" /> 立即参与
            </button>
          </div>
        ))}
      </div>

      {/* Trending Topics */}
      <div className="mt-6 px-4">
        <h2 className="text-white font-bold text-lg mb-3">大家都在聊</h2>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map(topic => (
            <div key={topic.id} className="bg-[#1c1e2b] px-4 py-2 rounded-full flex items-center gap-2 border border-[#2a2c3d]">
              <span className="text-lg">{topic.icon}</span>
              <span className="text-sm text-gray-200">{topic.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 语音派对 */}
      <div className="mt-6 px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white font-bold text-lg">🪐 语音派对</h2>
          <button onClick={() => setIsCreatingRoom(true)} className="text-cyan-400 text-xs flex items-center bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-500/20 hover:bg-cyan-400/20 transition">
            <Plus size={12} className="mr-1" /> 开派对
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {voiceRooms.map(room => (
            <div
              key={room.id}
              onClick={() => navigate(`/voiceroom/${room.id}`)}
              className="flex-shrink-0 w-[240px] bg-[#1c1e2b] rounded-xl p-4 flex flex-col gap-3 relative cursor-pointer hover:ring-1 hover:ring-cyan-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-white font-medium text-sm line-clamp-1 flex-1 pr-2">{room.title}</h3>
                <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-md flex items-center shrink-0">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span> LIVE
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <img src={room.owner.avatar} className="w-5 h-5 rounded-full mr-2 bg-gray-700" />
                <span className="line-clamp-1">{room.owner.name}</span>
                <span className="ml-auto flex items-center"><Headphones size={10} className="mr-1"/> {room.listeners}</span>
              </div>
              <div className="flex gap-2">
                {room.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] text-cyan-200 bg-cyan-900/40 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
          {voiceRooms.length === 0 && (
            <div className="text-sm text-gray-500 py-4 w-full text-center bg-[#1c1e2b] rounded-xl border border-dashed border-gray-700">
              目前没有活跃派对，自己开一个吧
            </div>
          )}
        </div>
      </div>

      {/* 创建房间 Modal */}
      {isCreatingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1e2b] w-full max-w-sm rounded-2xl p-6 relative border border-white/10 shadow-2xl">
            <button onClick={() => setIsCreatingRoom(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-6">创建语音派对</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">房间主题</label>
              <input
                type="text"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="给派对起个有趣的名字吧..."
                className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                autoFocus
              />
            </div>

            <button
              onClick={handleCreateVoiceRoom}
              disabled={!newRoomTitle.trim()}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:text-gray-400 text-black font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              立即开启
            </button>
          </div>
        </div>
      )}

      {/* 推荐帖子瀑布流 */}
      <div className="mt-6 px-4 flex flex-col gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-[#1c1e2b] p-4 rounded-2xl border border-[#2a2c3d]">
            <div className="flex items-center gap-3 mb-3" onClick={() => handleUserClick(post.user)}>
              <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-gray-700" />
              <div>
                <h4 className="text-white text-sm font-medium">{post.user.name}</h4>
                <p className="text-gray-500 text-xs">来自 {post.tags[0] || '推荐'}</p>
              </div>
            </div>

            <p className="text-gray-200 text-[15px] mb-3 leading-relaxed">{post.content}</p>

            {post.type === 'image' && post.coverImage && (
              <div className="w-full h-48 bg-gray-800 rounded-xl mb-3 overflow-hidden">
                <img src={post.coverImage} className="w-full h-full object-cover" />
              </div>
            )}

            {post.type === 'voice' && post.voiceDuration && (
              <div className="w-2/3 h-10 bg-cyan-500/20 rounded-full flex items-center px-4 mb-3 border border-cyan-500/30">
                <Play size={16} className="text-cyan-400 mr-2" />
                <div className="flex-1 h-1 bg-cyan-400/30 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-cyan-400 rounded-full"></div>
                </div>
                <span className="text-cyan-400 text-xs ml-3">{post.voiceDuration}</span>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#2a2c3d]">
               <LikeButton initialLikes={post.likes} />
               <div className="flex items-center gap-4 text-gray-400">
                 <button className="flex items-center gap-1 hover:text-white transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                 </button>
                 <button className="flex items-center gap-1 hover:text-white transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      <UserProfileModal
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
