import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import { MessageSquare, UserPlus, UserCheck, MoreHorizontal } from 'lucide-react';
import type { UserProfile, MomentData } from '../types';

export default function UserProfilePage({ hideTopBar }: { hideTopBar?: (hide: boolean) => void }) {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (hideTopBar) hideTopBar(true);
    return () => {
      if (hideTopBar) hideTopBar(false);
    };
  }, [hideTopBar]);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moments, setMoments] = useState<MomentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get<{ profile: UserProfile, moments: MomentData[], isFollowing: boolean }>(`/users/${id}`);
      setProfile(res.profile);
      setMoments(res.moments || []);
      setIsFollowing(res.isFollowing || false);
    } catch (err) {
      console.error('获取他人主页失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    const originalFollowing = isFollowing;
    setIsFollowing(!originalFollowing);

    // 乐观更新粉丝数
    setProfile({
      ...profile,
      followers: (profile.followers || 0) + (!originalFollowing ? 1 : -1)
    });

    try {
      if (!originalFollowing) {
        await api.post(`/users/${id}/follow`);
      } else {
        await api.delete(`/users/${id}/follow`);
      }
    } catch (e) {
      // 失败回滚
      setIsFollowing(originalFollowing);
      setProfile({
        ...profile,
        followers: (profile.followers || 0) + (originalFollowing ? 1 : -1)
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-[#12141d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full h-full bg-[#12141d] flex flex-col text-white">
        <PageHeader title="" />
        <div className="flex-1 flex items-center justify-center opacity-50">用户不存在或已被封禁</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col relative overflow-hidden">
      {/* 顶部背景图与导航 */}
      <div className="relative z-0">
        <UserProfileHeader
          name={profile.name}
          avatar={profile.avatar}
          bio={profile.bio}
          coverImage={profile.coverImage}
        />
        <div className="absolute top-0 w-full z-20 pointer-events-none">
          <PageHeader title="" rightAction={<div className="pointer-events-auto"><MoreHorizontal size={20} /></div>} transparent={true} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
        {/* 头部资料区补充内容 (ID, 统计, 按钮) */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-medium text-gray-300">ID: {id}</span>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-white font-bold text-lg">{profile.following}</div>
              <div className="text-gray-500 text-xs mt-1">关注</div>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="text-center">
              <div className="text-white font-bold text-lg">{(profile.followers || 0)}</div>
              <div className="text-gray-500 text-xs mt-1">粉丝</div>
            </div>
          </div>

          {/* 互动按钮 */}
          <div className="flex items-center justify-center gap-4 mt-8 w-full">
            <button
              onClick={handleFollowToggle}
              className={`flex-1 max-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-all ${
                isFollowing
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95'
              }`}
            >
              {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
              {isFollowing ? '已关注' : '关注'}
            </button>
            <button
              onClick={() => navigate('/chat')} // 实际应传 id 进入私聊
              className="flex-1 max-w-[140px] flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-colors"
            >
              <MessageSquare size={18} />
              私聊
            </button>
          </div>
        </div>

        {/* 动态列表 */}
        <div className="px-4 py-4 min-h-[400px]">
          <h3 className="text-white font-bold text-lg mb-4 ml-2">TA的瞬间 <span className="text-cyan-500 text-sm">{moments.length}</span></h3>

          {moments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
               <div className="text-4xl mb-4">📭</div>
               <p className="text-gray-400 text-sm">这里是一片荒芜，TA还没有发布过瞬间</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {moments.map(m => (
                <div
                  key={m.id}
                  onClick={() => navigate(`/moment/${m.id}`)}
                  className="bg-[#1c1e2b] rounded-2xl overflow-hidden aspect-[4/5] relative cursor-pointer active:scale-95 transition-transform border border-white/5"
                >
                  {(m as any).image ? (
                    <img src={(m as any).image} alt="post" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-between">
                       <p className="text-white/80 text-sm line-clamp-4">{(m as any).text}</p>
                       <span className="text-gray-500 text-[10px]">{new Date((m as any).time).toLocaleDateString()}</span>
                    </div>
                  )}
                  {(m as any).image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-medium line-clamp-2 shadow-sm drop-shadow-md">{(m as any).text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
