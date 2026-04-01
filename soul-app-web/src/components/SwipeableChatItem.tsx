import { useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Trash2, CheckCheck } from 'lucide-react';

export interface ChatData {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOfficial: boolean;
}

interface SwipeableChatItemProps {
  chat: ChatData;
  onClick: (chat: ChatData) => void;
  onDelete: (id: number) => void;
  onMarkRead: (id: number) => void;
}

const ACTION_WIDTH = 140; // Total width of hidden actions
const THRESHOLD = 60; // How far to drag before snapping open

export default function SwipeableChatItem({ chat, onClick, onDelete, onMarkRead }: SwipeableChatItemProps) {
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If we dragged past the threshold to the left, or we swiped fast to the left
    if (info.offset.x < -THRESHOLD || info.velocity.x < -500) {
      controls.start({ x: -ACTION_WIDTH, transition: { type: 'spring', stiffness: 300, damping: 30 } });
      setIsOpen(true);
    } else {
      // Snap back to 0
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
      setIsOpen(false);
    }
  };

  const handleContentClick = () => {
    if (isOpen) {
      // If open, click just closes the actions instead of entering the chat
      controls.start({ x: 0 });
      setIsOpen(false);
    } else {
      onClick(chat);
    }
  };

  return (
    <div className="relative overflow-hidden border-b border-white/5" ref={containerRef}>
      {/* Background Action Buttons */}
      <div className="absolute top-0 right-0 h-full flex items-stretch w-[140px]">
        <button
          onClick={() => { onMarkRead(chat.id); controls.start({ x: 0 }); setIsOpen(false); }}
          className="flex-1 bg-gray-600/80 hover:bg-gray-500/80 text-white flex flex-col items-center justify-center gap-1 transition-colors"
        >
          <CheckCheck size={18} />
          <span className="text-[10px] font-medium">已读</span>
        </button>
        <button
          onClick={() => onDelete(chat.id)}
          className="flex-1 bg-red-500/90 hover:bg-red-400/90 text-white flex flex-col items-center justify-center gap-1 transition-colors"
        >
          <Trash2 size={18} />
          <span className="text-[10px] font-medium">删除</span>
        </button>
      </div>

      {/* Swipeable Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        animate={controls}
        onDragEnd={handleDragEnd}
        onClick={handleContentClick}
        className="relative z-10 flex items-center gap-3.5 py-4 px-4 bg-[#12141d] active:bg-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        {/* Avatar container */}
        <div className="relative shrink-0 pointer-events-none">
          <img src={chat.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover bg-gray-800" />
          {chat.isOfficial && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full border-2 border-[#12141d] shadow-sm tracking-wider transform scale-90">
              官方
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-white text-[15px] font-bold truncate pr-2">{chat.name}</h4>
            <span className="text-gray-500 text-[11px] font-medium shrink-0">{chat.time}</span>
          </div>
          <p className="text-gray-400/80 text-[13px] truncate pr-4 leading-relaxed">{chat.lastMessage}</p>
        </div>

        {/* Unread badge */}
        {chat.unread > 0 && (
          <div className="shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold pointer-events-none">
            {chat.unread}
          </div>
        )}
      </motion.div>
    </div>
  );
}
