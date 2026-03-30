import TopBar from './components/TopBar';
import BottomNavBar from './components/BottomNavBar';
import PlanetPage from './pages/PlanetPage';

function App() {
  return (
    <div className="relative w-full h-[100dvh] bg-[#12141d] overflow-hidden font-sans">
      <TopBar />
      <PlanetPage />
      <BottomNavBar />
    </div>
  );
}

export default App;
