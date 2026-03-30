import { motion } from 'framer-motion';

export default function BottomActionCards() {
  const cards = [
    {
      id: 'meet',
      title: '灵魂匹配',
      subtitle: '剩余 3 次',
      bg: 'bg-[#55778a]',
      iconUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=meet&backgroundColor=transparent',
      width: 'min-w-[140px]'
    },
    {
      id: 'audio',
      title: '语音匹配',
      subtitle: '',
      bg: 'bg-[#407e74]',
      iconUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=audio&backgroundColor=transparent',
      width: 'min-w-[140px]',
      floatingBadge: '收到来电~'
    },
    {
      id: 'party',
      title: '群聊派对',
      subtitle: '快来抢麦',
      bg: 'bg-[#834996]',
      iconUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=party&backgroundColor=transparent',
      width: 'min-w-[140px]'
    },
    {
      id: 'soul',
      title: '脸基尼匹配',
      subtitle: '立即体验',
      bg: 'bg-[#8f5d4e]',
      iconUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=smile&backgroundColor=transparent',
      width: 'min-w-[140px]'
    }
  ];

  return (
    <div className="absolute bottom-[80px] w-full z-40 px-4">
      {/* Container for absolute floating elements that relate to the scroll area */}
      <div className="relative w-full mb-3 h-8">
        {/* Radar Button (Right aligned, floating above cards) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 -top-16 w-14 h-14 rounded-full bg-gradient-to-tr from-[#146a67] to-[#3BBCA2] flex items-center justify-center border border-white/20 shadow-lg z-50"
        >
          {/* Radar target circles */}
          <div className="w-6 h-6 rounded-full border border-white/80 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          {/* Ping effect */}
          <span className="absolute inset-0 rounded-full border-2 border-[#3BBCA2] animate-ping opacity-75 duration-1000"></span>
        </motion.button>

        {/* Floating "Incoming call~" badge for the second card */}
        <motion.div
          initial={{ y: 5 }}
          animate={{ y: -5 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
          className="absolute left-[160px] top-0 bg-[#407e74] text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg flex items-center z-50"
        >
          Incoming call~
          {/* Triangle pointer pointing down */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#407e74]"></div>
        </motion.div>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory no-scrollbar">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`relative flex-shrink-0 ${card.width} h-[130px] ${card.bg} rounded-2xl p-4 flex flex-col justify-end snap-start shadow-md overflow-hidden`}
          >
            {/* Background Graphic / Icon */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 opacity-90 flex justify-center items-center">
               <img src={card.iconUrl} alt={card.title} className="w-full h-full object-contain drop-shadow-md" />
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
