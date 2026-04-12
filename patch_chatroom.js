const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'soul-app-web', 'src', 'components', 'ChatRoom.tsx');
let code = fs.readFileSync(file, 'utf-8');

// Add MoreHorizontal import
if (!code.includes('MoreHorizontal')) {
  code = code.replace(/ChevronLeft, Phone, Video, Mic, Smile, Plus, Send, Camera/g, 'ChevronLeft, Phone, Video, Mic, Smile, Plus, Send, Camera, MoreHorizontal, AlertCircle, Ban, Trash2');
}

// Add api import
if (!code.includes("import { api } from '../api/client';")) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { api } from '../api/client';");
}

// Add state for settings menu
if (!code.includes('showSettings')) {
  code = code.replace('const [showEmojiMenu, setShowEmojiMenu] = useState(false);', 'const [showEmojiMenu, setShowEmojiMenu] = useState(false);\n  const [showSettings, setShowSettings] = useState(false);\n  const [toastMsg, setToastMsg] = useState("");');
}

// Add action handlers
if (!code.includes('handleBlockUser')) {
  const handlerCode = `
  const handleBlockUser = async () => {
    try {
      await api.post(\`/users/\${user?.id}/block\`);
      setToastMsg('已拉黑该用户');
      setTimeout(() => {
        setToastMsg('');
        setShowSettings(false);
        onBack(); // 退回聊天列表
      }, 1500);
    } catch (e) {
      setToastMsg('拉黑失败，请重试');
      setTimeout(() => setToastMsg(''), 1500);
    }
  };

  const handleReportUser = () => {
    setToastMsg('已提交举报，我们将尽快处理');
    setTimeout(() => {
      setToastMsg('');
      setShowSettings(false);
    }, 1500);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setToastMsg('聊天记录已清空');
    setTimeout(() => {
      setToastMsg('');
      setShowSettings(false);
    }, 1500);
  };
`;
  code = code.replace('const handleSend = () => {', handlerCode + '\n  const handleSend = () => {');
}

// Update Top Navigation Bar to add More button
if (!code.includes('onClick={() => setShowSettings(true)}')) {
  code = code.replace('<button className="hover:text-cyan-400 transition-colors"><Video size={20} /></button>', '<button className="hover:text-cyan-400 transition-colors"><Video size={20} /></button>\n              <button onClick={() => setShowSettings(true)} className="hover:text-cyan-400 transition-colors ml-2"><MoreHorizontal size={22} /></button>');
}

// Add Settings Menu UI (ActionSheet) & Toast
if (!code.includes('showSettings && (')) {
  const settingsMenuCode = `
          {/* Toast Message */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-24 left-1/2 z-[400] bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-full text-sm shadow-xl"
              >
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ActionSheet for Settings */}
          <AnimatePresence>
            {showSettings && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSettings(false)}
                  className="fixed inset-0 bg-black/60 z-[350] backdrop-blur-sm"
                />

                {/* Bottom Sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 bg-[#1c1e2b] z-[400] rounded-t-3xl border-t border-white/10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3" />

                  <div className="flex flex-col pb-safe">
                    <button
                      onClick={handleBlockUser}
                      className="flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-white/5 transition-colors active:bg-white/10 border-b border-white/5"
                    >
                      <Ban size={20} />
                      <span className="font-medium text-base">拉黑此人</span>
                    </button>

                    <button
                      onClick={handleReportUser}
                      className="flex items-center gap-3 px-6 py-4 text-white/90 hover:bg-white/5 transition-colors active:bg-white/10 border-b border-white/5"
                    >
                      <AlertCircle size={20} />
                      <span className="font-medium text-base">举报</span>
                    </button>

                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-3 px-6 py-4 text-white/90 hover:bg-white/5 transition-colors active:bg-white/10 border-b border-white/5"
                    >
                      <Trash2 size={20} />
                      <span className="font-medium text-base">清空聊天记录</span>
                    </button>

                    <div className="h-2 bg-[#12141d]" />

                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-6 py-4 text-white/70 hover:bg-white/5 transition-colors active:bg-white/10 text-center w-full font-medium text-base"
                    >
                      取消
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
`;
  code = code.replace('</AnimatePresence>\n\n        </motion.div>', '</AnimatePresence>\n' + settingsMenuCode + '\n        </motion.div>');
}

fs.writeFileSync(file, code);
