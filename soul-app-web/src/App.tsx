
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './components/TopBar';
import BottomNavBar from './components/BottomNavBar';
import PlanetPage from './pages/PlanetPage';
import ExplorePage from './pages/ExplorePage';
import ChatPage from './pages/ChatPage';
import MePage from './pages/MePage';

export type TabName = 'Planet' | 'Explore' | 'Chat' | 'Me';

function App() {
  const [activeTab, setActiveTab] = useState<TabName>('Planet');

  const renderPage = () => {
    switch (activeTab) {
      case 'Planet': return <PlanetPage />;
      case 'Explore': return <ExplorePage />;
      case 'Chat': return <ChatPage />;
      case 'Me': return <MePage />;
      default: return <PlanetPage />;
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#12141d] overflow-hidden font-sans">
      {/* TopBar is only visible on Planet Page for full immersion */}
      {activeTab === 'Planet' && <TopBar />}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Persistent Bottom Nav */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
