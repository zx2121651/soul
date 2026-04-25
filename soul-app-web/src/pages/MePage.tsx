

import { api } from '../api/client';
import type { MeDataResponse, UserProfile } from '../types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, ChevronRight, Bell, HelpCircle, LogOut, ChevronLeft, PenSquare, Lock, Loader2 } from 'lucide-react';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import ProfileStatsBar from '../components/profile/ProfileStatsBar';
import MomentCard from '../components/MomentCard';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function MePage({ onOpenEditor, hideTopBar }: { onOpenEditor?: () => void, hideTopBar?: (hide: boolean) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (hideTopBar) hideTopBar(true);
    return () => {
      if (hideTopBar) hideTopBar(false);
    };
  }, [hideTopBar]);
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'moments' | 'cocreate' | 'about'>('moments');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '星球居民',
    id: user?.uuid || 'soul_...',
    avatar: user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2',
    followers: 0,
    following: 0,
    visitors: 0,
    bio: '正在连接星球信号...'
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    // 从后端真实的获取当前登录用户的信息
    api.get<MeDataResponse>('/users/me')
      .then(data => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(err => console.error("获取个人资料失败", err))
      ;
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['my-moments', user?.id],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<{ moments: any[], nextCursor: number | null }>(
        `/users/${user?.id}/moments?limit=10${pageParam ? `&cursor=${pageParam}` : ''}`
      );
      return res;
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user?.id && activeTab === 'moments',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMoments = data?.pages.flatMap(page => page.moments) || [];


  return (
    <div className="w-full h-full bg-[#12141d] overflow-y-auto no-scrollbar pb-24 relative">

      {/* Background Cover Area */}
      <div className="relative z-0">
        <UserProfileHeader
          name={profile.name}
          avatar={profile.avatar}
          bio={profile.bio}
          coverImage={profile.coverImage}
        />

        {/* Top Header Actions */}
        <div className="absolute top-0 right-0 z-20 px-4 pt-12 pb-4 flex justify-end gap-4 text-white">
          <button onClick={() => navigate('/edit-profile')} className="bg-black/30 backdrop-blur-md p-2 rounded-full active:scale-95 transition-transform text-cyan-400">
            <PenSquare size={20} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-black/30 backdrop-blur-md p-2 rounded-full active:scale-95 transition-transform">
            <Settings size={20} />
          </button>
        </div>

        {/* Edit Button Overlay */}
        <div className="absolute top-[170px] right-6 z-20">
          <button className="flex items-center gap-2 bg-[#1c1e2b] px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10">
             <PenSquare size={16} />
             编辑主页
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative z-10 px-6">
        {/* VIP and Tags */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest italic shadow-sm transform -skew-x-6">VIP</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-[#8E5E99]/20 text-[#D7BDE2] px-2 py-1 rounded-md font-medium border border-[#8E5E99]/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D7BDE2]"></div>
              INTJ 建筑师
            </span>
            <span className="flex items-center gap-1 bg-[#4A8F85]/20 text-[#A3E4D7] px-2 py-1 rounded-md font-medium border border-[#4A8F85]/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A3E4D7]"></div>
              引力签: 艺术控
            </span>
            <span className="text-gray-400 bg-white/5 px-2 py-1 rounded-md">
              ♀ 22岁 · 杭州
            </span>
            <span className="text-gray-400 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1">
              🎮 蒸汽平台 1k+h
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-3 leading-relaxed">{profile.bio}</p>
        </div>


        {/* Stats */}
        <div className="mt-6 pb-6 border-b border-white/10">
          <ProfileStatsBar
            momentsCount={allMoments.length}
            followingCount={profile.following || 0}
            followersCount={profile.followers || 0}
            userId={user?.uuid}
          />
        </div>
      </div>

      {/* Tabs / Content Area */}
      <div className="relative z-10 px-6 mt-4">

         <div className="flex gap-6 border-b border-white/10 pb-2 mb-4 relative">
            <button
              onClick={() => setActiveTab('moments')}
              className={`text-base transition-colors ${activeTab === 'moments' ? 'text-white font-bold' : 'text-gray-500 font-medium'} pb-2`}
            >
              我的瞬间
            </button>
            <button
              onClick={() => setActiveTab('cocreate')}
              className={`text-base transition-colors ${activeTab === 'cocreate' ? 'text-white font-bold' : 'text-gray-500 font-medium'} pb-2`}
            >
              共创
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`text-base transition-colors ${activeTab === 'about' ? 'text-white font-bold' : 'text-gray-500 font-medium'} pb-2`}
            >
              关于我
            </button>
            {/* Animated Tab Indicator */}
            <motion.div
               className="absolute bottom-0 h-0.5 bg-cyan-400 rounded-full"
               initial={false}
               animate={{
                 left: activeTab === 'moments' ? '0%' : activeTab === 'cocreate' ? '30%' : '58%',
                 width: activeTab === 'moments' ? '64px' : activeTab === 'cocreate' ? '32px' : '48px'
               }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
         </div>


         {/* Grid Gallery */}

         {/* Tab Content Area */}
         <AnimatePresence mode="wait">
           {activeTab === 'moments' && (
             <motion.div
               key="moments"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
                {allMoments.length === 0 && status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-32 h-32 mb-6 opacity-40 grayscale">
                      <img src="/assets/avatars/avatar_1.svg" alt="empty" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">“这颗星球上还没有留下足迹”</p>
                    <button
                      onClick={onOpenEditor}
                      className="mt-6 bg-cyan-500/10 text-cyan-400 px-6 py-2 rounded-full text-xs font-bold border border-cyan-500/20 active:scale-95 transition-transform"
                    >
                      发布第一条瞬间
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="columns-2 gap-3 space-y-3">
                      {allMoments.map((moment) => (
                        <MomentCard
                          key={moment.id}
                          id={moment.id}
                          type={moment.type}
                          text={moment.text}
                          image={moment.image}
                          initialLikes={moment.initialLikes}
                          isLiked={moment.isLiked}
                          comments={moment.comments}
                          time={moment.time}
                        />
                      ))}
                    </div>

                    {/* Loading & Intersection Observer Anchor */}
                    <div ref={ref} className="py-8 flex justify-center items-center">
                      {isFetchingNextPage ? (
                        <div className="flex items-center gap-2 text-cyan-500/60 text-xs font-medium animate-pulse">
                          <Loader2 size={16} className="animate-spin" />
                          正在同步星际数据...
                        </div>
                      ) : hasNextPage ? (
                        <div className="h-4" />
                      ) : allMoments.length > 0 ? (
                        <div className="text-gray-600 text-[10px] tracking-widest uppercase">--- 已到达星系边缘 ---</div>
                      ) : null}
                    </div>
                  </>
                )}

                {/* Add Moment Floating Action (Optional, since we have the button in BottomNavBar) */}
             </motion.div>
           )}

           {activeTab === 'cocreate' && (
             <motion.div
               key="cocreate"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="flex flex-col items-center justify-center py-12 text-gray-500"
             >
               <div className="w-20 h-20 mb-4 bg-white/5 rounded-full flex items-center justify-center">
                 <PenSquare size={32} className="text-gray-600" />
               </div>
               <p className="text-sm">暂无共创内容</p>
               <button className="mt-4 text-cyan-400 text-xs font-medium border border-cyan-400/30 px-4 py-1.5 rounded-full">去寻找灵感</button>
             </motion.div>
           )}

           {activeTab === 'about' && (
             <motion.div
               key="about"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="space-y-6"
             >
               <div className="bg-[#1c1e2b] p-4 rounded-2xl border border-white/5">
                 <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-2"><div className="w-1 h-3 bg-cyan-400 rounded-full"></div>灵魂鉴定</h3>
                 <p className="text-gray-400 text-xs leading-relaxed">
                   你在星球上留下了许多独特的印记。系统分析出你是一个充满创造力、喜欢安静思考，但偶尔也会渴望疯狂派对的矛盾体。
                 </p>
               </div>
               <div className="bg-[#1c1e2b] p-4 rounded-2xl border border-white/5">
                 <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-2"><div className="w-1 h-3 bg-pink-400 rounded-full"></div>爱好星球</h3>
                 <div className="flex flex-wrap gap-2 mt-3">
                   {['独立游戏 🎮', '赛博朋克 🌆', 'R&B 🎧', '拿铁 ☕', '发呆 ☁️'].map(hobby => (
                     <span key={hobby} className="bg-white/5 text-gray-300 text-[11px] px-2.5 py-1 rounded-md">{hobby}</span>
                   ))}
                 </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

          </div>

      {/* Fullscreen Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col justify-center items-center"
          >
            <div className="absolute top-12 left-4 z-10" onClick={() => setSelectedImage(null)}>
              <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform">
                <ChevronLeft size={24} />
              </button>
            </div>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              className="w-full max-h-[80vh] object-contain"
              alt="fullscreen moment"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Settings Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[400] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-[#12141d] z-[401] shadow-[-10px_0_40px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="pt-14 pb-6 px-6 border-b border-white/5">
                <h2 className="text-white text-xl font-bold">设置</h2>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col space-y-1">
                  <button className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                    <div className="flex items-center gap-3 text-gray-200">
                      <Lock size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">账号与安全</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-500" />
                  </button>
                  <button className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                    <div className="flex items-center gap-3 text-gray-200">
                      <Bell size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">消息通知</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-500" />
                  </button>
                  <button className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                    <div className="flex items-center gap-3 text-gray-200">
                      <Eye size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">隐私设置</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-500" />
                  </button>
                  <button className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                    <div className="flex items-center gap-3 text-gray-200">
                      <HelpCircle size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">帮助与反馈</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 pb-12">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors active:scale-95"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
