import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, MapPin, Hash, Globe2, ChevronRight } from 'lucide-react';

interface PostMomentEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostMomentEditor({ isOpen, onClose }: PostMomentEditorProps) {
  const [content, setContent] = useState('');
  const [isSyncToPlanet, setIsSyncToPlanet] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Focus textarea with a slight delay to allow animation to complete
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handlePost = () => {
    // Mock posting logic
    setContent('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-[#12141d] z-[400] flex flex-col"
        >
          {/* Top Navigation Bar */}
          <div className="bg-[#12141d] pt-12 pb-4 px-4 flex items-center justify-between shrink-0">
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <X size={28} />
            </button>
            <h2 className="text-white font-bold text-lg">发布瞬间</h2>
            <button
              onClick={handlePost}
              disabled={content.trim().length === 0}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                content.trim().length > 0
                  ? 'bg-cyan-500 text-[#12141d] shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              发布
            </button>
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的此刻..."
              className="w-full bg-transparent text-white text-lg placeholder-gray-500 border-none outline-none resize-none min-h-[120px]"
              maxLength={500}
            />

            {/* Media Upload Button */}
            <div className="mt-4 flex gap-3">
              <button className="w-24 h-24 bg-[#1c1e2b] rounded-2xl border border-dashed border-gray-600 flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors active:scale-95">
                <ImageIcon size={28} className="text-gray-400" />
              </button>
            </div>

            {/* Options List */}
            <div className="mt-10 bg-[#1c1e2b] rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">

              {/* Hash Tag */}
              <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Hash size={16} className="text-cyan-400" />
                  </div>
                  <span className="text-gray-200 text-sm font-medium">添加标签</span>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </button>

              {/* Location */}
              <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <MapPin size={16} className="text-blue-400" />
                  </div>
                  <span className="text-gray-200 text-sm font-medium">你在哪里</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <span className="max-w-[100px] truncate">未知星球</span>
                  <ChevronRight size={20} />
                </div>
              </button>

              {/* Visibility */}
              <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors active:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Globe2 size={16} className="text-purple-400" />
                  </div>
                  <span className="text-gray-200 text-sm font-medium">谁可以看</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <span>公开</span>
                  <ChevronRight size={20} />
                </div>
              </button>
            </div>

            {/* Sync to Planet Switch */}
            <div className="mt-4 bg-[#1c1e2b] rounded-2xl px-4 py-4 border border-white/5 flex items-center justify-between">
              <span className="text-gray-200 text-sm font-medium">同步到星球动态</span>

              {/* Custom Toggle Switch */}
              <button
                onClick={() => setIsSyncToPlanet(!isSyncToPlanet)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isSyncToPlanet ? 'bg-cyan-500' : 'bg-gray-600'}`}
              >
                <motion.div
                  className="absolute top-1 bottom-1 w-4 bg-white rounded-full shadow-sm"
                  animate={{ left: isSyncToPlanet ? 'calc(100% - 20px)' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

          </div>

          {/* Bottom Toolbar (Keyboard accessory) */}
          <div className="bg-[#1c1e2b]/90 backdrop-blur-md px-4 py-3 border-t border-white/5 flex gap-4 shrink-0">
             <button className="text-gray-400 hover:text-white transition-colors"><ImageIcon size={22} /></button>
             <button className="text-gray-400 hover:text-white transition-colors"><Hash size={22} /></button>
             <button className="text-gray-400 hover:text-white transition-colors"><span className="font-bold text-lg leading-none">@</span></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
