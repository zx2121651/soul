import { Compass, MessageSquare, User, Plus, Globe } from 'lucide-react';

export default function BottomNavBar() {
  return (
    <div className="absolute bottom-0 w-full pb-6 pt-4 px-6 bg-transparent flex justify-between items-center z-50">

      {/* Planet (Active) */}
      <button className="flex flex-col items-center gap-1 text-cyan-400">
        <Globe size={24} />
        <span className="text-[10px] font-medium">Planet</span>
      </button>

      {/* Explore */}
      <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
        <Compass size={24} />
        <span className="text-[10px] font-medium">Explore</span>
      </button>

      {/* Center Plus Button */}
      <button className="relative -top-3 w-14 h-14 bg-cyan-300 rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(103,232,249,0.5)]">
        <Plus size={32} />
      </button>

      {/* Chat */}
      <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
        <div className="relative">
           <MessageSquare size={24} />
           <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#171822]"></div>
        </div>
        <span className="text-[10px] font-medium">Chat</span>
      </button>

      {/* Me */}
      <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
        <User size={24} />
        <span className="text-[10px] font-medium">Me</span>
      </button>

    </div>
  );
}
