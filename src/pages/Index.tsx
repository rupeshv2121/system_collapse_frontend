import GameScreen from '@/components/game/GameScreen';
import { Navbar } from '@/components/NavLink';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="relative z-[100]">
        <Navbar />
      </div>
      <GameScreen />
    </div>
  );
};

export default Index;
