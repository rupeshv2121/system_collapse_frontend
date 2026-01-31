import GameScreen from '@/components/game/GameScreen';
import { Navbar } from '@/components/NavLink';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Navbar />
      <GameScreen />
    </div>
  );
};

export default Index;
