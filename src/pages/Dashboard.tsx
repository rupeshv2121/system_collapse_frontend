import { Navbar } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { Activity, Award, Brain, Flame, Gamepad2, HelpCircle, Target, TrendingUp, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
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

// Animated Title Component
const AnimatedDashboardTitle = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const word1 = "SYSTEM";
  const word2 = "COLLAPSE";
  
  return (
    <h1 
      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-wider inline-block cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="inline-block">
        {word1.split('').map((letter, index) => (
          <span
            key={`w1-${index}`}
            className="inline-block text-gray-900 transition-all duration-300 ease-out"
            style={{
              transitionDelay: isHovered ? `${index * 40}ms` : `${(word1.length - index) * 25}ms`,
              transform: isHovered ? `translateY(${(index % 2 === 0 ? -6 : 6)}px) scale(1.05)` : 'translateY(0) scale(1)',
              color: isHovered ? '#2563eb' : '#111827',
            }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span className="inline-block mx-2 sm:mx-3"></span>
      <span className="inline-block">
        {word2.split('').map((letter, index) => (
          <span
            key={`w2-${index}`}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
            style={{
              transitionDelay: isHovered ? `${(word1.length + index) * 40}ms` : `${(word2.length - index) * 25}ms`,
              transform: isHovered ? `translateY(${(index % 2 === 0 ? 6 : -6)}px) scale(1.08) rotate(${index % 2 === 0 ? 1 : -1}deg)` : 'translateY(0) scale(1) rotate(0deg)',
              filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 12px rgba(147, 51, 234, 0.6))' : 'brightness(1)',
            }}
          >
            {letter}
          </span>
        ))}
      </span>
    </h1>
  );
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

  // Left sidebar stats configuration
  const leftStats = useMemo(() => [
    { icon: Trophy, label: 'High Score', value: userData.stats.highestScore, color: 'blue', isText: false },
    { icon: Target, label: 'Win Rate', value: `${winRate.toFixed(2)}%`, color: 'purple', isText: false },
    { icon: Activity, label: 'Total Games', value: userData.stats.totalGames, color: 'green', isText: false },
  ], [userData.stats.highestScore, userData.stats.totalGames, winRate]);

  // Right sidebar stats configuration
  const rightStats = useMemo(() => [
    { icon: Award, label: 'Play Style', value: userData.playerProfile.playStyle, color: 'indigo', isText: true },
    { icon: Flame, label: 'Win Streak', value: userData.stats.currentWinStreak, color: 'pink' },
    { icon: Zap, label: 'Collapses', value: userData.stats.collapseCount, color: 'orange' },
  ], [userData.playerProfile.playStyle, userData.stats.currentWinStreak, userData.stats.collapseCount]);

  // Quick stats configuration
  const quickStats = useMemo(() => [
    { icon: Trophy, label: 'Total Wins', value: userData.stats.wins, color: 'green' },
    { icon: TrendingUp, label: 'Best Streak', value: userData.stats.longestWinStreak, color: 'amber' },
    { icon: Brain, label: 'Archetype', value: userData.playerProfile.psychologicalArchetype.split('-')[0], fullValue: userData.playerProfile.psychologicalArchetype, color: 'purple', isText: true },
  ], [userData.stats.wins, userData.stats.longestWinStreak, userData.playerProfile.psychologicalArchetype]);

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

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest("button");
      if (!button || button.getAttribute("data-click-sfx") !== "true") return;

      const clickAudio = new Audio("/audio/clickfx.wav");
      clickAudio.volume = 1;
      clickAudio.play().catch(() => undefined);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
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
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[200px_1fr_200px] items-center">
            {/* Left sidebar - small stats */}
            <div className="space-y-4 order-2 lg:order-1 hidden lg:block">
              {leftStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`bg-white/70 backdrop-blur-sm border border-${stat.color}-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-${stat.color}-400 transition-all group cursor-default`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 text-${stat.color}-600 group-hover:scale-110 transition-transform`} />
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                    <div className={`text-2xl font-bold text-${stat.color}-600 group-hover:text-${stat.color}-700 transition-colors`}>{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Center - main content */}
            <div className="text-center space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 mt-10 xl:mt-0 mb-4 shadow-sm hover:shadow-md transition-all">
                <span className="text-blue-800 text-sm font-semibold">Welcome back, {playerName}!</span>
              </div>

              <div>
                <AnimatedDashboardTitle />
                <p className="text-base sm:text-lg text-gray-700 max-w-xl mx-auto mt-4">
                  An experimental game where rules intentionally collapse over time
                </p>
              </div>

              <div className="flex flex-col gap-4 items-center justify-center max-w-md mx-auto">
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  data-click-sfx="true"
                  className="w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 sm:py-7 text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group animate-pulse hover:animate-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                    START GAME
                  </span>
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={handleTutorial}
                    size="lg"
                    variant="outline"
                    data-click-sfx="true"
                    className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 px-6 py-3 sm:py-6 text-base rounded-xl transition-all hover:shadow-md"
                  >
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Tutorial
                  </Button>
                  <Button
                    onClick={() => navigate("/analytics")}
                    size="lg"
                    variant="outline"
                    data-click-sfx="true"
                    className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-3 sm:px-6 py-3 sm:py-6 text-base rounded-xl transition-all hover:shadow-md"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>

            {/* Right sidebar - small stats */}
            <div className="space-y-4 order-3 hidden lg:block">
              {rightStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`bg-white/70 backdrop-blur-sm border border-${stat.color}-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-${stat.color}-400 transition-all group cursor-default`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 text-${stat.color}-600 group-hover:scale-110 transition-transform`} />
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                    <div className={`${stat.isText ? 'text-sm' : 'text-2xl'} font-bold text-${stat.color}-600 group-hover:text-${stat.color}-700 transition-colors`}>{stat.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 sm:mt-12 space-y-6">
            {/* Mobile/Tablet Stats - Combined sidebars */}
            <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[...leftStats, ...rightStats].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`bg-white/70 backdrop-blur-sm border border-${stat.color}-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-${stat.color}-400 transition-all group cursor-default`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 text-${stat.color}-600 group-hover:scale-110 transition-transform`} />
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                    <div className={`${stat.isText ? 'text-sm' : 'text-xl'} font-bold text-${stat.color}-600 group-hover:text-${stat.color}-700 transition-colors truncate`}>{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats Summary */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200 p-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {quickStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="group cursor-default">
                      <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                      <div className="flex items-center justify-center gap-1">
                        <Icon className={`w-4 h-4 text-${stat.color}-600 group-hover:scale-110 transition-transform`} />
                        <span className={`${stat.isText ? 'text-xs' : 'text-lg'} font-bold text-${stat.color}-600 truncate`} title={stat.fullValue}>
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            {/* Leaderboard Button */}
            <div className="text-center">
              <Button
                onClick={() => navigate("/leaderboard")}
                variant="outline"
                data-click-sfx="true"
                className="text-gray-600 hover:text-blue-600 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all px-6 py-3 rounded-xl"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </div>
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
