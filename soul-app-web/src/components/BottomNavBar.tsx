
import type { TabName } from '../App';

interface BottomNavBarProps {
  onOpenEditor?: () => void;
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export default function BottomNavBar({ activeTab, onTabChange, onOpenEditor }: BottomNavBarProps) {

  return (
    <div className="absolute bottom-0 w-full pb-6 pt-4 px-6 bg-transparent flex justify-between items-center z-50">

      {/* Planet (Active) */}
      <button onClick={() => onTabChange('Planet')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'Planet' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>

<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C14.7 4 17.07 5.37 18.52 7.5L5.48 20.5C4.03 19.07 3.16 17.13 3.16 15C3.16 10.58 6.74 7 11.16 7H12V4ZM12 20C9.3 20 6.93 18.63 5.48 16.5L18.52 3.5C19.97 4.93 20.84 6.87 20.84 9C20.84 13.42 17.26 17 12.84 17H12V20Z" />
  <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-30 12 12)" fill="currentColor"/>
</svg>
        <span className="text-[10px] font-medium">星球</span>
      </button>

      {/* Explore */}
      <button onClick={() => onTabChange('Explore')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'Explore' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>

<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 10C4 5.58 7.58 2 12 2V4C8.69 4 6 6.69 6 10H4ZM4 6C4 2.69 6.69 0 10 0V2C7.79 2 6 3.79 6 6H4ZM19.29 15.29L16 12L12.71 15.29L14.12 16.71L15 15.83V20H17V15.83L17.88 16.71L19.29 15.29ZM12 22C6.48 22 2 17.52 2 12H0C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12H22C22 17.52 17.52 22 12 22Z"/>
  <circle cx="12" cy="12" r="6" fill="currentColor" />
  <circle cx="4" cy="4" r="2" fill="#FF5252" />
</svg>
        <span className="text-[10px] font-medium">广场</span>
      </button>

      {/* Center Plus Button */}
      <button onClick={onOpenEditor} className="relative -top-3 w-14 h-14 bg-cyan-300 rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(103,232,249,0.5)] transition-transform active:scale-95 hover:scale-105">

<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <line x1="12" y1="5" x2="12" y2="19"></line>
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>
      </button>

      {/* Chat */}
      <button onClick={() => onTabChange('Chat')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'Chat' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
        <div className="relative">

<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8 10C7.45 10 7 9.55 7 9C7 8.45 7.45 8 8 8C8.55 8 9 8.45 9 9C9 9.55 8.55 10 8 10ZM16 10C15.45 10 15 9.55 15 9C15 8.45 15.45 8 16 8C16.55 8 17 8.45 17 9C17 9.55 16.55 10 16 10ZM12 16C9.33 16 7.08 14.42 6 12H18C16.92 14.42 14.67 16 12 16Z"/>
  <circle cx="8" cy="9" r="1.5" fill="#171822"/>
  <circle cx="16" cy="9" r="1.5" fill="#171822"/>
</svg>
           <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#171822]"></div>
        </div>
        <span className="text-[10px] font-medium">聊天</span>
      </button>

      {/* Me */}
      <button onClick={() => onTabChange('Me')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'Me' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>

<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#FFCC80"/>
  <path d="M12 2C8 2 5 6 5 10C5 12 6.5 13.5 8 13.5H16C17.5 13.5 19 12 19 10C19 6 16 2 12 2Z" fill="#D84315"/>
  <circle cx="9" cy="10" r="1" fill="#3E2723"/>
  <circle cx="15" cy="10" r="1" fill="#3E2723"/>
</svg>
        <span className="text-[10px] font-medium">自己</span>
      </button>

    </div>
  );
}
