import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MomentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [moment, setMoment] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await api.get<{ moment: any, comments: any[] }>(`/moments/${id}`);
      setMoment(res.moment);
      setComments(res.comments || []);
    } catch (err) {
      console.error('获取动态详情失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleLike = async () => {
    if (!moment) return;
    const originalLiked = moment.isLiked;
    // 乐观 UI
    setMoment({
      ...moment,
      isLiked: !originalLiked,
      initialLikes: moment.initialLikes + (originalLiked ? -1 : 1)
    });
    try {
      await api.post(`/moments/${id}/like`, { like: !originalLiked });
    } catch (e) {
      // 回滚
      setMoment({
        ...moment,
        isLiked: originalLiked,
        initialLikes: moment.initialLikes + (originalLiked ? 1 : -1)
      });
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post<{ comment: any }>(`/moments/${id}/comments`, { content: newComment });
      setComments([res.comment, ...comments]);
      setMoment({ ...moment, comments: moment.comments + 1 });
      setNewComment('');
    } catch (err) {
      console.error('评论发表失败', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-[#12141d] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-cyan-400 mt-4 text-sm tracking-widest font-bold">正在提取动态印记...</span>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="w-full h-full bg-[#12141d] flex flex-col">
        <PageHeader title="动态详情" />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <span className="text-4xl mb-4">🛸</span>
          <p>这条动态似乎已经消失在宇宙深处...</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-white/10 rounded-full text-white text-sm">返回广场</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col relative overflow-hidden">
      <PageHeader title="动态详情" rightAction={<MoreHorizontal size={20} />} />

      {/* 滚动区域 */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* 作者信息与内容正文 */}
        <div className="p-4 bg-[#1c1e2b] border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div
              onClick={(e) => { e.stopPropagation(); navigate(`/user/${moment.author.id}`); }}
              className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0 cursor-pointer active:scale-95 transition-transform border border-white/10"
            >
              <img src={moment.author.avatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); navigate(`/user/${moment.author.id}`); }}>
              <h3 className="text-white text-sm font-bold truncate">{moment.author.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{new Date(moment.time).toLocaleString()}</p>
            </div>
            {!moment.author.isSelf && (
              <button className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 active:scale-95 transition-transform">
                + 关注
              </button>
            )}
          </div>

          <p className="text-white/90 text-base leading-relaxed mb-4 whitespace-pre-wrap break-words">
            {moment.text}
          </p>

          {moment.image && (
            <div className="w-full rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/5">
              <img src={moment.image} alt="moment_media" className="w-full h-auto max-h-[400px] object-cover" />
            </div>
          )}

          {/* 标签区 */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {moment.tags.map((t: string) => (
                <span key={t} className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* 互动操作区 */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              <button onClick={handleLike} className="flex items-center gap-2 text-gray-400 active:scale-95 transition-all">
                <motion.div animate={moment.isLiked ? { scale: [1, 1.3, 1] } : {}}>
                  <Heart size={22} className={moment.isLiked ? "text-pink-500 fill-pink-500" : ""} />
                </motion.div>
                <span className={`text-sm font-medium ${moment.isLiked ? 'text-pink-500' : ''}`}>
                  {moment.initialLikes || '赞'}
                </span>
              </button>
              <button className="flex items-center gap-2 text-gray-400">
                <MessageCircle size={22} />
                <span className="text-sm font-medium">{moment.comments || '评论'}</span>
              </button>
            </div>
            <button className="text-gray-400 p-2">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* 评论列表区 */}
        <div className="px-4 py-6">
          <h4 className="text-white text-sm font-bold mb-6">共 {comments.length} 条评论</h4>

          {comments.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-10">
              <div className="text-4xl mb-2 opacity-50">🛋️</div>
              暂无评论，快来抢个沙发吧
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${c.author.id}`); }}
                    className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 shrink-0 cursor-pointer"
                  >
                    <img src={c.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-gray-400 text-xs font-medium" onClick={(e) => { e.stopPropagation(); navigate(`/user/${c.author.id}`); }}>
                        {c.author.name}
                      </span>
                      <span className="text-gray-600 text-[10px]">{c.time}</span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部吸底发送评论栏 */}
      <div className="absolute bottom-0 w-full bg-[#1c1e2b]/95 backdrop-blur-xl border-t border-white/5 p-3 flex gap-3 items-center z-10 pb-6">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="说点什么..."
          className="flex-1 bg-[#12141d] text-white text-sm rounded-full px-4 py-2.5 outline-none border border-white/5 focus:border-cyan-500/50 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendComment();
          }}
        />
        <button
          onClick={handleSendComment}
          disabled={!newComment.trim()}
          className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
            newComment.trim()
              ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95'
              : 'bg-white/5 text-gray-500'
          }`}
        >
          <Send size={18} className={newComment.trim() ? 'ml-0.5' : ''} />
        </button>
      </div>

    </div>
  );
}
