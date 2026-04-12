import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import { Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostData {
  id: number;
  author: { id: number; name: string; avatar: string };
  content: string;
  coverImage?: string;
  type: string;
  tags: string[];
  time: string;
  likes: number;
  comments: number;
}

export default function TagMomentsPage() {
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tagName) return;

    api.get<{ posts: PostData[] }>(`/moments/tag/${encodeURIComponent(tagName)}`)
      .then(res => setPosts(res.posts || []))
      .catch(err => console.error('获取标签动态失败', err))
      .finally(() => setLoading(false));
  }, [tagName]);

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col relative overflow-hidden">
      <PageHeader title="" transparent={true} />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10 -mt-12">
        {/* 顶部标签横幅区 */}
        <div className="bg-gradient-to-b from-cyan-900/40 to-[#12141d] px-6 pt-16 pb-6 flex flex-col items-center border-b border-white/5">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Hash size={40} className="text-cyan-400" />
          </div>
          <h1 className="text-white text-2xl font-black tracking-wide">#{tagName}</h1>
          <p className="text-gray-400 text-xs mt-2 font-medium bg-white/5 px-4 py-1.5 rounded-full">
            共计 {posts.length} 条瞬间动态
          </p>
        </div>

        {/* 动态瀑布流 */}
        <div className="px-4 py-6 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-16 opacity-50">
              <div className="text-5xl mb-4">🪐</div>
              <p>这个星球暂时还没有留下关于该话题的印记</p>
            </div>
          ) : (
            posts.map(post => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={post.id}
                className="bg-[#1c1e2b] p-4 rounded-2xl border border-[#2a2c3d]"
              >
                <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => navigate(`/user/${post.author.id}`)}>
                  <img src={post.author.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                  <div>
                    <h4 className="text-white text-sm font-medium">{post.author.name}</h4>
                    <p className="text-gray-500 text-[10px]">{new Date(post.time).toLocaleString()}</p>
                  </div>
                </div>

                <div className="cursor-pointer" onClick={() => navigate(`/moment/${post.id}`)}>
                  <p className="text-gray-200 text-[15px] mb-3 leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {post.content}
                  </p>

                  {post.type === 'image' && post.coverImage && (
                    <div className="w-full h-48 bg-gray-800 rounded-xl mb-3 overflow-hidden border border-white/5">
                      <img src={post.coverImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* 互动数据区 */}
                <div className="flex justify-between items-center pt-3 border-t border-[#2a2c3d]">
                  <div className="flex items-center gap-1.5 text-pink-500 text-sm font-bold">
                    ❤️ <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1.5"><MessageCircleIcon /> {post.comments}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 提取图标避免重复导入
function MessageCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
}
