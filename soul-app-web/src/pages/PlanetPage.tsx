import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Planet3D from '../components/Planet3D';
import type { NodeData } from '../components/Planet3D';
import { usePlanetNodes } from '../hooks/usePlanetNodes';

import BottomActionCards from '../components/BottomActionCards';
import type { UserProfileData } from '../components/UserProfileModal';
import MatchRadarOverlay from '../components/MatchRadarOverlay';
import UserProfileModal from '../components/UserProfileModal';

export default function PlanetPage() {
  const navigate = useNavigate();
  const { nodes, isLoading } = usePlanetNodes();
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isRadarOpen, setRadarOpen] = useState(false);

  const handleNodeClick = (node: NodeData) => {
    if (node.isSelf) return;
    // 使用 navigate 进行 SPA 路由跳转，避免 window.location.href 导致的完整页面刷新
    navigate(`/user/${node.id}`);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#171822]">
      {/* 3D Background */}
      <Planet3D onNodeClick={handleNodeClick} nodes={nodes} />

      {/* Loading indicator */}
      {isLoading && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Center Floating Prompt (above the self-planet) */}
      {!isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-24 z-30 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.2 },
              scale: { duration: 0.5, delay: 0.2 },
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
            }}
            className="relative bg-[#0d151c]/90 backdrop-blur-md border-[1.5px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-cyan-400 text-[13px] px-5 py-2 rounded-full flex items-center gap-2 whitespace-nowrap font-bold tracking-wide pointer-events-auto cursor-pointer"
            onClick={() => setRadarOpen(true)}
          >
            加速中，立即体验！ <span className="text-white/90 text-xs ml-1">&gt;</span>
            {/* Bottom precise cyan arrow */}
            <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-400 filter drop-shadow-[0_4px_4px_rgba(34,211,238,0.5)]"></div>
            {/* Inner dark cover for the arrow */}
            <div className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#0d151c]/90"></div>
          </motion.div>
        </div>
      )}

      {/* Bottom Horizontal Scrolling Cards */}
      <BottomActionCards onMatchClick={() => setRadarOpen(true)} />

      {/* User Profile Modal Overlay */}
      <UserProfileModal
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      {/* Radar Overlay */}
      <MatchRadarOverlay isOpen={isRadarOpen} onClose={() => setRadarOpen(false)} />
    </div>
  );
}
