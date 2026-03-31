import { Settings, PenSquare, Eye } from 'lucide-react';

export default function MePage() {
  return (
    <div className="w-full h-full bg-[#12141d] overflow-y-auto no-scrollbar pb-24 relative">

      {/* Background Cover */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-[#4A8F85]/60 to-[#12141d] z-0"></div>

      {/* Top Header Actions */}
      <div className="relative z-10 px-4 pt-12 pb-4 flex justify-end gap-4 text-white">
        <button className="bg-black/30 backdrop-blur-md p-2 rounded-full">
          <Eye size={20} />
        </button>
        <button className="bg-black/30 backdrop-blur-md p-2 rounded-full">
          <Settings size={20} />
        </button>
      </div>

      {/* Profile Info */}
      <div className="relative z-10 px-6 mt-4">
        <div className="flex items-center justify-between">
          {/* Avatar with glowing ring */}
          <div className="relative w-24 h-24 rounded-full border-4 border-[#12141d] bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=Me&backgroundColor=ffdfbf"
              alt="My Avatar"
              className="w-full h-full rounded-full object-cover"
            />
            {/* VIP or Status Badge */}
            <div className="absolute bottom-0 right-0 bg-[#F5B041] p-1 rounded-full border-2 border-[#12141d]">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-[#1c1e2b] px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10 mt-6">
             <PenSquare size={16} />
             编辑主页
          </button>
        </div>

        {/* Name and Tags */}
        <div className="mt-4">
          <h2 className="text-white text-2xl font-bold mb-2">自己 (Me)</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#8E5E99]/30 text-[#D7BDE2] px-2 py-1 rounded-md font-medium border border-[#8E5E99]/50">
              # INTJ 建筑师
            </span>
            <span className="bg-[#4A8F85]/30 text-[#A3E4D7] px-2 py-1 rounded-md font-medium border border-[#4A8F85]/50">
              引力签: 艺术控
            </span>
            <span className="text-gray-400 bg-white/5 px-2 py-1 rounded-md">
              ♀ 22岁 · 杭州
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-3">宇宙很大，生活更大。探索中...</p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-6 pb-6 border-b border-white/10">
          <div className="flex flex-col items-center">
             <span className="text-white font-bold text-lg">128</span>
             <span className="text-gray-500 text-xs">关注</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-white font-bold text-lg">342</span>
             <span className="text-gray-500 text-xs">粉丝</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-white font-bold text-lg">89</span>
             <span className="text-gray-500 text-xs">访客</span>
          </div>
        </div>
      </div>

      {/* Tabs / Content Area */}
      <div className="relative z-10 px-6 mt-4">
         <div className="flex gap-6 border-b border-white/10 pb-2 mb-4">
            <button className="text-white font-bold text-base border-b-2 border-cyan-400 pb-2">我的瞬间</button>
            <button className="text-gray-500 font-medium text-base pb-2">共创</button>
            <button className="text-gray-500 font-medium text-base pb-2">关于我</button>
         </div>

         {/* Grid Gallery */}
         <div className="grid grid-cols-3 gap-1">
            <div className="aspect-square bg-[#1c1e2b] relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop" className="w-full h-full object-cover" alt="moment" />
            </div>
            <div className="aspect-square bg-[#1c1e2b] relative overflow-hidden flex items-center justify-center p-2 text-center text-xs text-white bg-gradient-to-br from-[#8E5E99] to-[#4A235A]">
               "今天天气真好，去西湖边喝了咖啡。"
            </div>
            <div className="aspect-square bg-[#1c1e2b] relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=400&fit=crop" className="w-full h-full object-cover" alt="moment" />
            </div>
            <div className="aspect-square bg-[#1c1e2b] relative overflow-hidden flex flex-col items-center justify-center gap-2 p-2 text-center text-xs text-white border border-dashed border-white/20">
               <span className="text-gray-500 text-2xl">+</span>
               <span className="text-gray-500">发布瞬间</span>
            </div>
         </div>
      </div>
    </div>
  );
}
