import { useState, useEffect } from 'react';
import { Zap, Filter, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export default function TopBar() {
  const [announcement, setAnnouncement] = useState<{ title: string; content: string; type: string } | null>(null);

  useEffect(() => {
    // 获取最新系统广播
    api.get<{ latest: any }>('/announcements')
      .then(data => {
        if (data.latest) {
          setAnnouncement(data.latest);
        }
      })
      .catch(err => console.error("获取广播失败", err));
  }, []);

  return (
    <>
      <div className="absolute top-0 w-full px-4 pt-12 pb-4 flex justify-between items-center z-50 text-white">
        {/* Planet Boost Button */}
        <button className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/10 shadow-sm px-3 py-1.5 rounded-full text-sm font-medium">
          <Zap size={16} className="text-cyan-400 fill-cyan-400" />
          <span>星球加速</span>
        </button>

        {/* Soul Logo placeholder */}
        <div className="text-2xl font-bold tracking-widest text-cyan-200">
          Soul
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/10 shadow-sm px-3 py-1.5 rounded-full text-sm font-medium">
          <Filter size={16} className="text-cyan-400" />
          <span>筛选</span>
        </button>
      </div>

      {/* 系统跑马灯/通知横幅 */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-[80px] w-[92%] left-[4%] z-40 overflow-hidden rounded-full shadow-lg border"
            style={{
              background: announcement.type === 'warning' ? 'rgba(239, 68, 68, 0.85)' :
                          announcement.type === 'system' ? 'rgba(168, 85, 247, 0.85)' : 'rgba(34, 211, 238, 0.85)',
              borderColor: announcement.type === 'warning' ? 'rgba(252, 165, 165, 0.5)' :
                           announcement.type === 'system' ? 'rgba(216, 180, 254, 0.5)' : 'rgba(165, 243, 252, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="flex items-center px-4 py-2 relative">
              <Bell size={16} className="text-white min-w-[16px] mr-2" />
              <div className="flex-1 overflow-hidden relative" style={{ height: '20px' }}>
                <motion.div
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  className="whitespace-nowrap text-white text-xs font-medium absolute left-0"
                >
                  <span className="font-bold mr-2">[{announcement.title}]</span>
                  {announcement.content}
                </motion.div>
              </div>
              <button
                onClick={() => setAnnouncement(null)}
                className="ml-2 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}