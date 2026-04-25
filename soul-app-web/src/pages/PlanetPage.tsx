import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

      {/* Mid-right vertical banner */}
      {!isLoading && (
        <div className="absolute right-0 top-[40%] -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none">
          <div
            className="bg-[#1f212c]/90 backdrop-blur-md border border-white/5 rounded-l-xl py-6 px-2 text-white/90 text-[10px] font-medium tracking-widest cursor-pointer hover:bg-[#2a2c3a]/90 transition-colors shadow-lg flex flex-col items-center leading-loose pointer-events-auto"
          >
            <span>同</span>
            <span>城</span>
            <span>卡</span>
            <span className="opacity-40 my-0.5">/</span>
            <span>加</span>
            <span>速</span>
            <span>卡</span>
            <span className="opacity-40 my-0.5">/</span>
            <span>定</span>
            <span>位</span>
            <span>卡</span>
            <span className="mt-2 text-[10px] opacity-60">〉</span>
          </div>
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
