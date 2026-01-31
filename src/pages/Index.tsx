import GameScreen from '@/components/game/GameScreen';
import { Navbar } from '@/components/NavLink';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="relative z-[100]">
        <Navbar />
      </div>
      <GameScreen />
    </div>
  );
};

export default Index;
