import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface MatchRadarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockMatches = [
  { name: '陈子豪', match: 98, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=chen&backgroundColor=b6e3f4' },
  { name: '一只小橘猫🐱', match: 92, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf' },
  { name: '夏天🌿', match: 89, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede' }
];

export default function MatchRadarOverlay({ isOpen, onClose }: MatchRadarOverlayProps) {
  const navigate = useNavigate();
  const [matchState, setMatchState] = useState<'scanning' | 'matched'>('scanning');
  const [matchedUser, setMatchedUser] = useState<typeof mockMatches[0] | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMatchState('scanning');
      setMatchedUser(null);

      const timer = setTimeout(() => {
        // 调用真实的匹配接口
        api.post<{ success: boolean, matchUser: any }>('/social/match')
          .then(data => {
            if (data.success && data.matchUser) {
              setMatchedUser(data.matchUser);
              setMatchState('matched');
            }
          })
          .catch(err => {
            console.error("匹配失败", err);
            // 兜底假数据
            setMatchedUser(mockMatches[0]);
            setMatchState('matched');
          });
      }, 3000); // 3 seconds scan

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Fullscreen Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0A0D14]/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-12 left-6 text-gray-400 hover:text-white bg-white/10 p-2 rounded-full"
        >
          <X size={24} />
        </button>

        {matchState === 'scanning' ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
            className="relative flex flex-col items-center justify-center w-full h-full"
          >
            {/* Concentric Circles (Ping) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 2, 4], opacity: [0.8, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border border-cyan-400/50"
              />
              <motion.div
                animate={{ scale: [1, 3, 5], opacity: [0.6, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.6 }}
                className="absolute w-32 h-32 rounded-full border border-cyan-400/30"
              />
              <motion.div
                animate={{ scale: [1, 4, 6], opacity: [0.4, 0.1, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1.2 }}
                className="absolute w-32 h-32 rounded-full border border-cyan-400/20"
              />
            </div>

            {/* Radar Conic Sweep */}
            <div className="relative w-64 h-64 rounded-full border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
               {/* Background Grid Lines */}
               <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-[0.3]"></div>
               <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-[0.6]"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[1px] h-full bg-cyan-500/20"></div>
                 <div className="h-[1px] w-full bg-cyan-500/20 absolute"></div>
               </div>

               {/* Sweeping gradient */}
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="absolute inset-0 origin-center"
                 style={{
                   background: 'conic-gradient(from 0deg, transparent 0%, rgba(34, 211, 238, 0.1) 70%, rgba(34, 211, 238, 0.8) 100%)'
                 }}
               />
            </div>

            {/* Center Avatar during scan */}
            <div className="absolute w-14 h-14 bg-[#1c1e2b] border-2 border-cyan-400 rounded-full overflow-hidden z-10 shadow-[0_0_20px_#22d3ee]">
               <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Me&backgroundColor=ffdfbf" alt="me" className="w-full h-full object-cover" />
            </div>

            <div className="mt-16 text-cyan-400 text-lg font-medium tracking-widest animate-pulse">
              正在寻找契合的灵魂...
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative flex flex-col items-center bg-[#1c1e2b] w-4/5 max-w-sm rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
          >
             {/* Match Confetti / Glow */}
             <div className="absolute -top-20 w-40 h-40 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full blur-[60px] opacity-30"></div>

             <h2 className="text-white text-3xl font-black mb-6 italic">匹配成功!</h2>

             <div className="relative w-32 h-32 rounded-full border-4 border-[#12141d] bg-gray-800 shadow-xl overflow-hidden mb-4">
                <img src={matchedUser?.avatar} alt={matchedUser?.name} className="w-full h-full object-cover" />
             </div>

             <h3 className="text-white text-xl font-bold">{matchedUser?.name}</h3>

             <div className="mt-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="text-cyan-400 text-sm font-bold">灵魂匹配度 {matchedUser?.match}%</span>
             </div>

             <p className="text-gray-400 text-xs mt-4 text-center">缘分让你们相遇，快去打个招呼吧~</p>

             <button
                onClick={() => { onClose(); navigate('/chat'); }}
                className="mt-8 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full py-4 flex items-center justify-center gap-2 font-bold shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-transform active:scale-95">
                <MessageSquare size={20} fill="currentColor" />
                打个招呼
             </button>

             <button onClick={onClose} className="mt-4 text-gray-500 text-sm font-medium hover:text-gray-300 transition-colors">
               稍后再说
             </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
