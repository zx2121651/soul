import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MessageSquare, Heart, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export interface UserProfileData {
  id: string | number;
  name: string;
  avatar: string;
  match?: number;
  isOnline?: boolean;
  gender?: 'male' | 'female';
  age?: number;
  location?: string;
  mbti?: string;
  tags?: string[];
  signature?: string;
  voiceDuration?: number;
}

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfileData | null;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, user, onClose }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 w-full bg-[#1c1e2b] rounded-t-3xl z-[101] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Drag Handle Indicator */}
            <div className="w-full flex justify-center py-3" onClick={onClose}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
            </div>

            {/* Header / Actions */}
            <div className="absolute top-4 right-4 flex gap-3">
              <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
                <ShieldAlert size={20} />
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar px-6 pb-24 flex-1">

              {/* Profile Top Section */}
              <div className="flex flex-col items-center mt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-[#12141d] bg-gray-800 shadow-xl overflow-hidden">
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  {user.isOnline !== false && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#1c1e2b] rounded-full"></div>
                  )}
                </div>

                <h2 className="text-white text-2xl font-bold mt-4 flex items-center gap-2">
                  {user.name}
                  {user.gender === 'female' ? (
                    <span className="bg-pink-500/20 text-pink-400 text-[10px] px-1.5 py-0.5 rounded">♀ {user.age || 22}</span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded">♂ {user.age || 24}</span>
                  )}
                </h2>

                <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2">
                  <MapPin size={12} />
                  {user.location || "未知星球"}
                  <span className="mx-1">·</span>
                  刚刚活跃
                </div>

                {/* Match Percentage Ring */}
                {user.match && (
                   <div className="mt-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 flex items-center gap-2">
                      <Sparkles size={14} className="text-cyan-400" />
                      <span className="text-cyan-400 text-sm font-bold">灵魂匹配度 {user.match}%</span>
                   </div>
                )}
              </div>

              {/* Voice Signature */}
              <div className="mt-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-gray-400 text-xs mb-2 font-medium">语音签名</div>
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-[#12141d] shrink-0 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Play size={18} className="ml-1" fill="currentColor" />
                  </button>
                  <div className="flex-1 h-6 flex items-center gap-1 overflow-hidden">
                    {/* Mock Audio Waveform */}

                    {[...Array(20)].map((_, i) => {
                      const h1 = 4;
                      const h2 = Math.random() * 20 + 4;
                      return (
                        <motion.div
                          key={i}
                          animate={{ height: [h1, h2, h1] }}
                          transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                          className="w-1 bg-cyan-400/50 rounded-full"
                        />
                      );
                    })}

                  </div>
                  <span className="text-cyan-400 text-xs font-mono w-6 text-right shrink-0">{user.voiceDuration || 8}s</span>
                </div>
              </div>

              {/* Tags & MBTI */}
              <div className="mt-6">
                 <div className="text-gray-400 text-xs mb-3 font-medium">引力签 & 瞬间</div>
                 <div className="flex flex-wrap gap-2">
                   <span className="bg-[#8E5E99]/20 text-[#D7BDE2] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#8E5E99]/30">
                     {user.mbti || "ENFP 竞选者"}
                   </span>
                   {(user.tags || ["音乐控", "夜猫子", "铲屎官", "喜欢独处"]).map((tag, idx) => (
                     <span key={idx} className="bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10">
                       {tag}
                     </span>
                   ))}
                 </div>
              </div>

              {/* Bio / Signature */}
              <div className="mt-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {user.signature || "有些事情不说是个结，说了是个疤。希望能在这里遇见能听懂我的人。"}
                </p>
              </div>

            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="absolute bottom-0 w-full bg-[#1c1e2b]/90 backdrop-blur-lg border-t border-white/10 p-4 pb-8 flex gap-4">
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-3.5 flex items-center justify-center gap-2 font-bold transition-colors">
                <Heart size={20} />
                关注
              </button>
              <button className="flex-[2] bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full py-3.5 flex items-center justify-center gap-2 font-bold shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-transform">
                <MessageSquare size={20} fill="currentColor" />
                打个招呼
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
