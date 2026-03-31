import { Search } from 'lucide-react';

const mockChats = [
  {
    id: 1,
    name: "Soul官方助手",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=soul&backgroundColor=c0aede",
    lastMessage: "你的星球有了新的访客，快去看看吧！",
    time: "10:30",
    unread: 2,
    isOfficial: true
  },
  {
    id: 2,
    name: "一只小橘猫🐱",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=ffdfbf",
    lastMessage: "哈哈，那个表情包也太逗了吧",
    time: "昨天",
    unread: 0,
    isOfficial: false
  },
  {
    id: 3,
    name: "陈子豪",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chen&backgroundColor=b6e3f4",
    lastMessage: "周末有空一起打游戏吗？",
    time: "星期二",
    unread: 1,
    isOfficial: false
  },
  {
    id: 4,
    name: "夏天🌿",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=summer&backgroundColor=c0aede",
    lastMessage: "[图片]",
    time: "星期一",
    unread: 0,
    isOfficial: false
  },
  {
    id: 5,
    name: "林深见鹿🦌",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=deer&backgroundColor=d4fc79",
    lastMessage: "晚安啦~",
    time: "10-15",
    unread: 0,
    isOfficial: false
  }
];

export default function ChatPage() {
  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col pt-12 pb-24">

      {/* Top Header */}
      <div className="px-4 pb-2 flex justify-between items-center shrink-0">
        <h1 className="text-white text-2xl font-bold">聊天</h1>
        <div className="flex gap-4">
          <button className="text-gray-300">发现群聊</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 shrink-0">
        <div className="bg-[#1c1e2b] rounded-full flex items-center px-4 py-2 gap-2">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="搜索聊天记录"
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
          />
        </div>
      </div>

      {/* Heartbeat Match Banner */}
      <div className="px-4 py-2 shrink-0">
        <div className="bg-gradient-to-r from-[#2B404E] to-[#4A8F85] rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

          <div className="relative z-10">
            <h3 className="text-white font-bold text-base mb-1">今日心动匹配</h3>
            <p className="text-white/70 text-xs">有 3 位 Souler 正在等你</p>
          </div>
          <button className="relative z-10 bg-white text-[#2A5C54] px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
            去看看
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 mt-2">
        {mockChats.map((chat) => (
          <div key={chat.id} className="flex items-center gap-3 py-3 border-b border-white/5 cursor-pointer active:bg-white/5 transition-colors">
            {/* Avatar container */}
            <div className="relative shrink-0">
              <img src={chat.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover bg-gray-800" />
              {chat.isOfficial && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-[8px] font-bold px-1 rounded-sm border border-[#12141d]">
                  官方
                </div>
              )}
            </div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-white text-sm font-medium truncate pr-2">{chat.name}</h4>
                <span className="text-gray-500 text-xs shrink-0">{chat.time}</span>
              </div>
              <p className="text-gray-400 text-xs truncate pr-4">{chat.lastMessage}</p>
            </div>

            {/* Unread badge */}
            {chat.unread > 0 && (
              <div className="shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {chat.unread}
              </div>
            )}
          </div>
        ))}

        <div className="text-center text-gray-600 text-xs py-6">
          没有更多聊天记录了
        </div>
      </div>
    </div>
  );
}
