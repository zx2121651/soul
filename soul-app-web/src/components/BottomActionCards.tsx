import { motion } from 'framer-motion';

export default function BottomActionCards({ onMatchClick }: { onMatchClick?: () => void }) {

  const cards = [
    {
      id: 'meet',
      title: '灵魂匹配',
      subtitle: '剩余 3 次',
      bg: 'bg-gradient-to-br from-[#537685] to-[#2B404E]',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="40" fill="#FFCDB2"/>
          {/* Hat */}
          <path d="M10 50 Q50 30 90 50 L80 60 Q50 40 20 60 Z" fill="#E29578"/>
          <path d="M30 40 Q50 10 70 40" fill="#E29578"/>
          <circle cx="35" cy="55" r="4" fill="#6B705C"/>
          <circle cx="65" cy="55" r="4" fill="#6B705C"/>
          <path d="M45 70 Q50 75 55 70" stroke="#B5838D" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      ),
      width: 'min-w-[130px]'
    },
    {
      id: 'audio',
      title: '语音匹配',
      subtitle: '',
      bg: 'bg-gradient-to-br from-[#4A8F85] to-[#2A5C54]',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <rect x="35" y="20" width="30" height="45" rx="15" fill="#A3E4D7"/>
          <path d="M25 45 v10 a25 25 0 0 0 50 0 v-10" stroke="#A3E4D7" strokeWidth="6" fill="none" strokeLinecap="round"/>
          <line x1="50" y1="80" x2="50" y2="90" stroke="#A3E4D7" strokeWidth="6" strokeLinecap="round"/>
          <line x1="35" y1="90" x2="65" y2="90" stroke="#A3E4D7" strokeWidth="6" strokeLinecap="round"/>
          {/* Audio Waves */}
          <line x1="15" y1="40" x2="15" y2="60" stroke="#A3E4D7" strokeWidth="4" strokeLinecap="round"/>
          <line x1="5" y1="45" x2="5" y2="55" stroke="#A3E4D7" strokeWidth="4" strokeLinecap="round"/>
          <line x1="85" y1="40" x2="85" y2="60" stroke="#A3E4D7" strokeWidth="4" strokeLinecap="round"/>
          <line x1="95" y1="45" x2="95" y2="55" stroke="#A3E4D7" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="43" cy="35" r="3" fill="#17202A"/>
          <circle cx="57" cy="35" r="3" fill="#17202A"/>
          <path d="M47 45 Q50 48 53 45" stroke="#17202A" strokeWidth="2" fill="none"/>
        </svg>
      ),
      width: 'min-w-[130px]',
      floatingBadge: '收到来电~'
    },
    {
      id: 'party',
      title: '群聊派对',
      subtitle: '快来抢麦',
      bg: 'bg-gradient-to-br from-[#8E5E99] to-[#482855]',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <path d="M30 80 Q30 20 50 20 Q70 20 70 80 Q65 75 60 80 Q55 75 50 80 Q45 75 40 80 Q35 75 30 80" fill="#F4ECF7"/>
          <circle cx="42" cy="45" r="4" fill="#4A235A"/>
          <circle cx="58" cy="45" r="4" fill="#4A235A"/>
          <ellipse cx="50" cy="55" rx="5" ry="6" fill="#4A235A"/>
          {/* Glowsticks */}
          <line x1="15" y1="70" x2="25" y2="50" stroke="#F5B041" strokeWidth="4" strokeLinecap="round"/>
          <line x1="85" y1="70" x2="75" y2="50" stroke="#F5B041" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      ),
      width: 'min-w-[130px]'
    },
    {
      id: 'soul',
      title: '脸基尼匹配',
      subtitle: '立即体验',
      bg: 'bg-gradient-to-br from-[#9F7A6E] to-[#51362E]',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="35" fill="#FAD7A1"/>
          <circle cx="35" cy="45" r="5" fill="#5D4037"/>
          <circle cx="65" cy="45" r="5" fill="#5D4037"/>
          <path d="M35 60 Q50 75 65 60" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <circle cx="20" cy="50" r="8" fill="#FAD7A1"/>
          <circle cx="80" cy="50" r="8" fill="#FAD7A1"/>
        </svg>
      ),
      width: 'min-w-[130px]'
    }
  ];


  return (
    <div className="absolute bottom-[80px] w-full z-40 px-4 pointer-events-none">
      {/* Container for absolute floating elements that relate to the scroll area */}
      <div className="relative w-full mb-3 h-8 pointer-events-none">
        {/* Radar Button (Right aligned, floating above cards) */}
        <motion.button
          onClick={onMatchClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 -top-16 w-14 h-14 rounded-full bg-gradient-to-tr from-[#146a67] to-[#3BBCA2] flex items-center justify-center border border-white/20 shadow-[0_4px_20px_rgba(59,188,162,0.4)] z-50 pointer-events-auto"
        >
          {/* Radar target circles */}
          <div className="w-6 h-6 rounded-full border border-white/80 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          {/* Ping effect */}
          <span className="absolute inset-0 rounded-full border-2 border-[#3BBCA2] animate-ping opacity-60"></span>
        </motion.button>

        {/* Floating "收到来电~" badge for the second card */}
        <motion.div
          initial={{ y: 5 }}
          animate={{ y: -5 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
          className="absolute left-[160px] top-0 bg-[#407e74] text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg flex items-center z-50"
        >
          收到来电~
          {/* Triangle pointer pointing down */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#407e74]"></div>
        </motion.div>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory no-scrollbar pointer-events-auto">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 0.98, y: -2 }} whileTap={{ scale: 0.92 }}
            onClick={() => card.id === 'meet' && onMatchClick && onMatchClick()}
            className={`relative flex-shrink-0 cursor-pointer ${card.width} h-[130px] ${card.bg} rounded-2xl p-4 flex flex-col justify-end snap-start shadow-md overflow-hidden`}
          >
            {/* Background Graphic / Icon */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 opacity-90 flex justify-center items-center">
               {card.svg}
            </div>

            <div className="relative z-10 text-center w-full">
              <h3 className="text-white font-bold text-sm leading-tight">{card.title}</h3>
              {card.subtitle && (
                <p className="text-white/80 text-[10px] mt-0.5">{card.subtitle}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
