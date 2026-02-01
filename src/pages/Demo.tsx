import { Navbar } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { Activity, Gamepad2, HelpCircle, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TUTORIAL_SEEN_KEY = "rule-collapse-tutorial-seen";

// Animated background tiles with chaos effect
const AnimatedTile = ({ 
  delay, 
  color, 
  top, 
  left, 
  size 
}: { 
  delay: number; 
  color: string; 
  top: string; 
  left: string; 
  size: number;
}) => {
  const [isVisible, setIsVisible] = useState(Math.random() > 0.5);
  const [glowIntensity, setGlowIntensity] = useState(0.05);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly appear/disappear
      setIsVisible(Math.random() > 0.3);
      // Random glow intensity for chaos effect
      setGlowIntensity(Math.random() * 0.2 + 0.05);
    }, 1200 + delay * 150);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <div
      className={`absolute rounded-lg ${color} transition-all duration-1000 ease-in-out`}
      style={{ 
        opacity: isVisible ? glowIntensity : 0,
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 ${size * 0.8}px ${size * 0.4}px currentColor`,
        filter: `blur(${Math.random() * 2}px)`,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      }}
    />
  );
};

// Generate random tiles for chaotic background
const generateTiles = () => {
  const tiles = [];
  const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-pink-500', 'text-cyan-500', 'text-orange-500', 'text-indigo-500', 'text-rose-500'];
  
  // Generate 40-50 tiles scattered across the screen
  for (let i = 0; i < 45; i++) {
    tiles.push({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.floor(Math.random() * 60) + 40, // 40-100px
      delay: Math.random() * 10,
    });
  }
  return tiles;
};

const Demo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserData();
  const [backgroundTiles] = useState(generateTiles());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const playerName =
    (user?.user_metadata as { username?: string } | undefined)?.username ||
    user?.email?.split("@")[0] ||
    "Player";

  const winRate = useMemo(() => {
    if (!userData?.stats?.totalGames) return 0;
    return Math.round((userData.stats.wins / userData.stats.totalGames) * 100);
  }, [userData.stats.totalGames, userData.stats.wins]);

  const handleStartGame = () => navigate("/game");
  const handleTutorial = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "false");
    navigate("/game");
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay may be blocked; user can start via unmute/interaction.
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <audio ref={audioRef} src="/audio/music.mp3" loop preload="auto" />
      {/* Animated background tiles - chaotic system breakdown visual */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {backgroundTiles.map((tile) => (
          <AnimatedTile
            key={tile.id}
            delay={tile.delay}
            color={tile.color}
            top={tile.top}
            left={tile.left}
            size={tile.size}
          />
        ))}
      </div>

      <div className="relative z-[100]">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[200px_1fr_200px] gap-8 items-center">
            {/* Left sidebar - small stats */}
            <div className="space-y-4">
              <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">High Score</div>
                <div className="text-xl font-bold text-blue-600">{userData.stats.highestScore}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Win Rate</div>
                <div className="text-xl font-bold text-purple-600">{winRate}%</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-green-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Total Games</div>
                <div className="text-xl font-bold text-green-600">{userData.stats.totalGames}</div>
              </div>
            </div>

            {/* Center - main content */}
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 text-sm font-medium">Welcome back, {playerName}</span>
              </div>

              <div>
                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4 tracking-wider">
                  SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">COLLAPSE</span>
                </h1>
                <p className="text-lg text-gray-700 max-w-xl mx-auto">
                  An experimental game where rules intentionally collapse over time
                </p>
              </div>

              <div className="flex flex-col gap-4 items-center justify-center max-w-md mx-auto">
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  START GAME
                </Button>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={handleTutorial}
                    size="lg"
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-6 text-base rounded-xl"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Tutorial
                  </Button>
                  <Button
                    onClick={() => navigate("/analytics")}
                    size="lg"
                    variant="outline"
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-6 text-base rounded-xl"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>

            {/* Right sidebar - small stats */}
            <div className="space-y-4">
              <div className="bg-white/60 backdrop-blur-sm border border-indigo-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Play Style</div>
                <div className="text-sm font-semibold text-indigo-600">{userData.playerProfile.playStyle}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-pink-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Win Streak</div>
                <div className="text-xl font-bold text-pink-600">{userData.stats.currentWinStreak}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-orange-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Collapses</div>
                <div className="text-xl font-bold text-orange-600">{userData.stats.collapseCount}</div>
              </div>
            </div>
          </div>

          {/* Bottom link */}
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/leaderboard")}
              variant="ghost"
              className="text-gray-600 hover:text-blue-600"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>

      {/* Audio controls */}
      <div className="fixed right-6 top-[30%] -translate-y-1/2 z-[120]">
        <div className="group relative flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="h-12 w-12 rounded-full bg-white/80 border border-blue-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <div className="h-32 w-12 rounded-full bg-white/70 border border-blue-200 shadow-sm flex items-center justify-center opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="h-24 w-6 [writing-mode:vertical-rl] rotate-180 accent-blue-600"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
