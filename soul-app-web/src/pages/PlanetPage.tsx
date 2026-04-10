


import { api } from '../api/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Planet3D from '../components/Planet3D';
import type { NodeData } from '../components/Planet3D';
import * as THREE from 'three';

import BottomActionCards from '../components/BottomActionCards';
import type { UserProfileData } from '../components/UserProfileModal';
import MatchRadarOverlay from '../components/MatchRadarOverlay';
import UserProfileModal from '../components/UserProfileModal';




export default function PlanetPage() {

  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isRadarOpen, setRadarOpen] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);

  useEffect(() => {
    api.get<{ nodes: NodeData[] }>('/planet').then(data => {
        const fetchedNodes = data.nodes || [];
        const SPHERE_RADIUS = 3.5;
        const colors = ["#ff9a9e", "#fecfef", "#a1c4fd", "#c2e9fb", "#d4fc79", "#96e6a1"];

        const newNodes: NodeData[] = [];
        newNodes.push({
          id: 0,
          position: new THREE.Vector3(0, 0, SPHERE_RADIUS * 1.05),
          name: "自己",
          match: 100,
          color: "#ffffff",
          isSelf: true,
          phase: 0,
          speed: 1,
          amplitude: 0.1
        });

        const NUM_NODES = fetchedNodes.length + 1;
        const phi = Math.PI * (3 - Math.sqrt(5));

        fetchedNodes.forEach((n: any, idx: number) => {
          const i = idx + 1;
          const y = 1 - (i / (NUM_NODES - 1)) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = phi * i;
          const jitterRadius = radius + (Math.random() - 0.5) * 0.8;
          const jitterTheta = theta + (Math.random() - 0.5) * 0.5;
          const jitterY = y + (Math.random() - 0.5) * 0.5;
          const x = Math.cos(jitterTheta) * jitterRadius;
          const z = Math.sin(jitterTheta) * jitterRadius;

          newNodes.push({
            id: n.id,
            position: new THREE.Vector3(x * SPHERE_RADIUS, jitterY * SPHERE_RADIUS, z * SPHERE_RADIUS),
            name: n.name,
            match: n.match,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5,
            amplitude: 0.05 + Math.random() * 0.15
          });
        });

        setNodes(newNodes);
      });
  }, []);


  const handleNodeClick = (node: NodeData) => {
    if (node.isSelf) return;
    // 直接跳转到他人主页
    window.location.href = `/user/${node.id}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#171822]">
      {/* 3D Background */}
      <Planet3D onNodeClick={handleNodeClick} nodes={nodes} />

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
