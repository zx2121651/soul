import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Phone, Video, Mic, Smile, Plus } from 'lucide-react';

interface ChatRoomProps {
  user: {
    id: number;
    name: string;
    avatar: string;
    isOnline?: boolean;
    isOfficial?: boolean;
  } | null;
  onBack: () => void;
}

export default function ChatRoom({ user, onBack }: ChatRoomProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock message history
  const [messages] = useState([
    { id: 1, text: "嗨！", isMe: false, time: "10:28" },
    { id: 2, text: "你好呀！", isMe: true, time: "10:29" },
    { id: 3, text: "刚看到你的瞬间，感觉很有趣呢。你平时喜欢摄影吗？", isMe: false, time: "10:29" },
    { id: 4, text: "对的，周末喜欢带着相机到处逛逛。你呢？", isMe: true, time: "10:30" },
    { id: 5, text: "我也是！改天有机会可以一起去拍点照片呀~", isMe: false, time: "10:31" },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, user]);

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed inset-0 bg-[#12141d] z-[300] flex flex-col"
        >
          {/* Top Navigation Bar */}
          <div className="bg-[#1c1e2b]/95 backdrop-blur-md pt-12 pb-4 px-4 flex items-center justify-between border-b border-white/5 shrink-0 z-10">
            <button onClick={onBack} className="text-white hover:text-cyan-400 transition-colors p-1 -ml-1">
              <ChevronLeft size={28} />
            </button>

            <div className="flex flex-col items-center flex-1">
              <h2 className="text-white font-bold text-lg flex items-center gap-1.5">
                {user.name}
                {user.isOfficial && (
                  <span className="bg-yellow-500 text-[#12141d] text-[10px] px-1 rounded-sm">官方</span>
                )}
              </h2>
              {user.isOnline && (
                 <span className="text-green-400 text-[10px] font-medium flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> 在线
                 </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-white">
              <button className="hover:text-cyan-400 transition-colors"><Phone size={20} /></button>
              <button className="hover:text-cyan-400 transition-colors"><Video size={20} /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <div className="text-center text-xs text-gray-500 my-4">昨天 10:28</div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                {!msg.isMe && (
                  <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full bg-gray-800 object-cover shrink-0" />
                )}

                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.isMe
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white rounded-br-sm'
                    : 'bg-[#252836] text-white rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-[#1c1e2b] p-4 pb-8 shrink-0 flex items-center gap-3 border-t border-white/5">
             <button className="text-gray-400 hover:text-white transition-colors bg-[#252836] p-2.5 rounded-full">
               <Mic size={20} />
             </button>

             <div className="flex-1 bg-[#252836] rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-cyan-500/50 transition-colors">
               <input
                 type="text"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder="发消息..."
                 className="bg-transparent border-none outline-none text-white text-sm w-full"
               />
               <button className="text-gray-400 hover:text-white transition-colors ml-2">
                 <Smile size={20} />
               </button>
             </div>

             {inputText.trim().length === 0 ? (
               <button className="text-gray-400 hover:text-white transition-colors bg-[#252836] p-2.5 rounded-full">
                 <Plus size={20} />
               </button>
             ) : (
               <button className="bg-cyan-500 text-[#12141d] font-bold text-sm px-4 py-2 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)] active:scale-95 transition-transform">
                 发送
               </button>
             )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
