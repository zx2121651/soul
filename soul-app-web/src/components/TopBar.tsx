import { Zap, Filter } from 'lucide-react';

export default function TopBar() {
  return (
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
  );
}
