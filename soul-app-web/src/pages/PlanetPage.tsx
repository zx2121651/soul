

import { useState } from 'react';
import { motion } from 'framer-motion';
import Planet3D from '../components/Planet3D';
import type { NodeData } from '../components/Planet3D';
import BottomActionCards from '../components/BottomActionCards';
import type { UserProfileData } from '../components/UserProfileModal';
import MatchRadarOverlay from '../components/MatchRadarOverlay';
import UserProfileModal from '../components/UserProfileModal';



export default function PlanetPage() {

  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isRadarOpen, setRadarOpen] = useState(false);

  const handleNodeClick = (node: NodeData) => {
    if (node.isSelf) return; // Optional: do not show modal for self

    // Transform NodeData to UserProfileData
    setSelectedUser({
      id: node.id,
      name: node.name,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + node.name + '&backgroundColor=b6e3f4', // mock avatar
      match: node.match,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: Math.floor(18 + Math.random() * 10),
      location: '银河系',
      isOnline: Math.random() > 0.3
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#171822]">
      {/* 3D Background */}
      <Planet3D onNodeClick={handleNodeClick} />

      {/* Center Floating Prompt (above the self-planet) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-24 z-30 pointer-events-none">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ opacity: { duration: 0.5, delay: 0.5 }, scale: { duration: 0.5, delay: 0.5 }, y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }}
          className="relative bg-[#0d151c]/90 backdrop-blur-md border-[1.5px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-cyan-400 text-[13px] px-5 py-2 rounded-full flex items-center gap-2 whitespace-nowrap font-bold tracking-wide"
        >
          加速中，立即体验！ <span className="text-white/90 text-xs ml-1">&gt;</span>
          {/* Bottom precise cyan arrow (using CSS triangle trick and pseudo positioning) */}
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-400 filter drop-shadow-[0_4px_4px_rgba(34,211,238,0.5)]"></div>
          {/* Inner dark cover for the arrow to look like a border */}
          <div className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#0d151c]/90"></div>
        </motion.div>

      </div>

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
