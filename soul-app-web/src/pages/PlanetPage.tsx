import { motion } from 'framer-motion';
import Planet3D from '../components/Planet3D';
import BottomActionCards from '../components/BottomActionCards';

export default function PlanetPage() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#171822]">
      {/* 3D Background */}
      <Planet3D />

      {/* Center Floating Prompt (above the self-planet) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-24 z-30 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ opacity: { duration: 0.5, delay: 0.5 }, scale: { duration: 0.5, delay: 0.5 }, y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }}
          className="relative bg-black/50 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-sm px-5 py-2 rounded-full flex items-center gap-2 whitespace-nowrap font-medium"
        >
          加速中，立即体验！ <span className="text-white">&gt;</span>
        </motion.div>
      </div>

      {/* Bottom Horizontal Scrolling Cards */}
      <BottomActionCards />

    </div>
  );
}
