import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Phone, Video, Mic, Smile, Plus, Send, Camera } from 'lucide-react';

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


  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);

  const togglePlusMenu = () => {
    setShowPlusMenu(!showPlusMenu);
    if(showEmojiMenu) setShowEmojiMenu(false);
  };
  const toggleEmojiMenu = () => {
    setShowEmojiMenu(!showEmojiMenu);
    if(showPlusMenu) setShowPlusMenu(false);
  };

  const [messages, setMessages] = useState([
    { id: 1, text: "嗨！", isMe: false, time: "10:28" },
    { id: 2, text: "你好呀！", isMe: true, time: "10:29" },
    { id: 3, text: "刚看到你的瞬间，感觉很有趣呢。你平时喜欢摄影吗？", isMe: false, time: "10:29" },
    { id: 4, text: "对的，周末喜欢带着相机到处逛逛。你呢？", isMe: true, time: "10:30" },
    { id: 5, text: "我也是！改天有机会可以一起去拍点照片呀~", isMe: false, time: "10:31" },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      text: inputText,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setShowPlusMenu(false);
    setShowEmojiMenu(false);
    setInputText('');
  };

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
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full border border-[#12141d] shadow-sm tracking-wider transform scale-90">官方</span>
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
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative no-scrollbar">
            <div className="text-center text-xs text-gray-500 my-4 font-medium">昨天 10:28</div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className={`flex items-end gap-2.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}
                >
                  {!msg.isMe && (
                    <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full bg-gray-800 object-cover shrink-0 shadow-sm" />
                  )}

                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.isMe
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white rounded-br-sm'
                      : 'bg-[#252836] text-white rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="bg-[#1c1e2b] p-4 pb-8 shrink-0 flex items-center gap-3 border-t border-white/5 relative z-20">
             <button className="text-gray-400 hover:text-white transition-colors bg-[#252836] p-2.5 rounded-full shrink-0">
               <Mic size={20} />
             </button>

             <div className="flex-1 bg-[#252836] rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-cyan-500/50 transition-colors">
               <input
                 type="text"
                 value={inputText}
                 onChange={(e) => { setInputText(e.target.value); setShowPlusMenu(false); setShowEmojiMenu(false); }}
                 onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                 placeholder="发消息..."
                 className="bg-transparent border-none outline-none text-white text-sm w-full"
               />
               <button onClick={toggleEmojiMenu} className={`transition-colors ml-2 shrink-0 ${showEmojiMenu ? "text-cyan-400" : "text-gray-400 hover:text-white"}`}>
                 <Smile size={20} />
               </button>
             </div>

             {inputText.trim().length === 0 ? (
               <button onClick={togglePlusMenu} className={`transition-colors bg-[#252836] p-2.5 rounded-full shrink-0 ${showPlusMenu ? "text-cyan-400" : "text-gray-400 hover:text-white"}`}>
                 <Plus size={20} className={showPlusMenu ? "rotate-45 transition-transform" : "transition-transform"} />
               </button>
             ) : (
               <motion.button
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 onClick={handleSend}
                 className="bg-cyan-500 text-[#12141d] font-bold text-[13px] px-4 py-2.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)] active:scale-95 transition-transform flex items-center justify-center shrink-0"
               >
                 <Send size={16} className="mr-1" />
                 发送
               </motion.button>
             )}
          </div>

          {/* Rich Media Drawers */}
          <AnimatePresence>
            {showEmojiMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 200, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#1c1e2b] border-t border-white/5 shrink-0 overflow-hidden"
              >
                <div className="p-4 grid grid-cols-6 gap-4 text-3xl">
                  {['😀','😂','🥰','😎','🥺','🤔','😭','😡','👻','👽','👍','✌️'].map(emoji => (
                     <button key={emoji} onClick={() => setInputText(prev => prev + emoji)} className="hover:scale-125 transition-transform active:scale-95">{emoji}</button>
                  ))}
                </div>
              </motion.div>
            )}

            {showPlusMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 120, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#1c1e2b] border-t border-white/5 shrink-0 overflow-hidden"
              >
                <div className="p-6 flex gap-6">
                  <div className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="w-14 h-14 bg-[#252836] rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                       <Camera size={24} className="text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-400">拍摄</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="w-14 h-14 bg-[#252836] rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <span className="text-xs text-gray-400">相册</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
