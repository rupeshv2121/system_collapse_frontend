/**
 * Main Game Screen Component
 * Orchestrates all game UI elements
 */

import { Button } from '@/components/ui/button';
import { useBeatSync } from '@/hooks/useBeatSync';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useGameState } from '@/hooks/useGameState.tsx';
import { cn } from '@/lib/utils';
import { BarChart3, HelpCircle, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GameGrid from './GameGrid';
import HUD from './HUD';
import InstructionDisplay from './InstructionDisplay';
import SystemHint from './SystemHint';
import Tutorial from './Tutorial';

const TUTORIAL_SEEN_KEY = 'rule-collapse-tutorial-seen';

const GameScreen = () => {
  const { gameState, handleTileClick, startGame, phaseConfig } = useGameState();
  const { score, phase, entropy, sanity, timeRemaining, tiles, currentInstruction, isPlaying } = gameState;
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
  });
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const prevPhaseRef = useRef(phase);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedFirstTile = useRef(false);
  const playStartRef = useRef<number | null>(null);
  
  // Beat synchronization
  const beatSync = useBeatSync(bgMusicRef);
  
  const {
    isMuted,
    initAudio,
    toggleMute,
    playTileClick,
    playPhaseTransition,
    playGameOver,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateMusicForPhase,
  } = useGameAudio();

  // Update music based on game state
  useEffect(() => {
    if (isPlaying) {
      updateMusicForPhase(phase, entropy, sanity);
      
      // Play phase transition sound
      if (phase !== prevPhaseRef.current) {
        playPhaseTransition(phase);
        prevPhaseRef.current = phase;
      }
    }
  }, [isPlaying, phase, entropy, sanity, updateMusicForPhase, playPhaseTransition]);

  // Handle game start/end for audio
  useEffect(() => {
    if (isPlaying) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
      // Stop background music when game ends
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      hasPlayedFirstTile.current = false;
      if (score !== 0 || entropy !== 0) {
        const won = score > 50 && entropy >= 100;
        playGameOver(won);
      }
    }
  }, [isPlaying, score, entropy, startBackgroundMusic, stopBackgroundMusic, playGameOver]);

  // Handle muting the background music
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Show tutorial on first visit
  useEffect(() => {
    if (!hasSeenTutorial && !isPlaying) {
      setShowTutorial(true);
    }
  }, [hasSeenTutorial, isPlaying]);

  // Control body overflow to hide scrollbar when overlay is visible
  useEffect(() => {
    if (!isPlaying) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPlaying]);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  }, []);

  const handleStartGame = useCallback(() => {
    initAudio();
    setPlayTimeSeconds(0);
    playStartRef.current = null;
    setTimerActive(false);
    startGame();
  }, [initAudio, startGame]);

  // Global playtime tracker (starts on first tile click)
  useEffect(() => {
    let intervalId: number | undefined;

    if (isPlaying && timerActive) {
      intervalId = window.setInterval(() => {
        if (playStartRef.current) {
          const elapsed = (Date.now() - playStartRef.current) / 1000;
          setPlayTimeSeconds(elapsed);
        }
      }, 500);
    } else {
      if (playStartRef.current) {
        const elapsed = (Date.now() - playStartRef.current) / 1000;
        setPlayTimeSeconds(elapsed);
        playStartRef.current = null;
        setTimerActive(false);
      }
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isPlaying, timerActive]);

  const formatPlayTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleTileClickWithSound = useCallback((tileId: number) => {
    // Start background music on first tile click
    if (!hasPlayedFirstTile.current && bgMusicRef.current) {
      bgMusicRef.current.play().catch(err => console.warn('Audio play failed:', err));
      hasPlayedFirstTile.current = true;
    }
    // Start playtime on first tile click
    if (!playStartRef.current) {
      playStartRef.current = Date.now();
      setPlayTimeSeconds(0);
      setTimerActive(true);
    }

    const tile = tiles.find(t => t.id === tileId);
    if (tile) {
      const wasCorrect = tile.color === gameState.secretCorrectColor;
      playTileClick(tile.color, phase, wasCorrect);
    }
    handleTileClick(tileId);
  }, [tiles, gameState.secretCorrectColor, phase, playTileClick, handleTileClick]);

  // Background chaos effects
  const backgroundStyle = useMemo(() => {
    return {
      filter: phase >= 3 ? `hue-rotate(${entropy * 0.5}deg)` : undefined,
      opacity: phaseConfig.visualEffects.opacity,
    };
  }, [phase, entropy, phaseConfig]);

  // Container style for explosion/scatter effects
  const containerStyle = useMemo(() => {
    const scatterStyles: React.CSSProperties = {};
    
    if (beatSync.isExploding) {
      // Generate random scatter values for explosion effect
      const angle = Math.random() * Math.PI * 2;
      const distance = beatSync.scatterAmount;
      scatterStyles['--scatter-x' as any] = `${Math.cos(angle) * distance}px`;
      scatterStyles['--scatter-y' as any] = `${Math.sin(angle) * distance}px`;
      scatterStyles['--scatter-rotate' as any] = `${(Math.random() - 0.5) * 180}deg`;
    }
    
    return scatterStyles;
  }, [beatSync.isExploding, beatSync.scatterAmount]);

  // Game over screen
  const GameOverOverlay = useCallback(() => {
    if (isPlaying) return null;
    
    const won = score > 50 && entropy >= 100;
    
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 animate-fade-in flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-2xl w-full">
          {score === 0 && entropy === 0 ? (
            // Start screen
            <>
              <h1 className="text-4xl md:text-6xl font-bold font-game neon-text tracking-wider text-gray-900">
                SYSTEM COLLAPSE
              </h1>
              <p className="text-gray-700 max-w-md mx-auto">
                An experimental game where rules intentionally collapse over time.
                The system starts stable — then becomes chaotic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleStartGame}
                  size="lg"
                  className="gap-2 font-game tracking-wider neon-glow"
                >
                  <Play className="w-5 h-5" />
                  START GAME
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="gap-2 font-game tracking-wider"
                  onClick={() => setShowTutorial(true)}
                >
                  <HelpCircle className="w-5 h-5" />
                  TUTORIAL
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-2 font-game tracking-wider"
                >
                  <Link to="/analytics">
                    <BarChart3 className="w-5 h-5" />
                    ANALYTICS
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            // Game over screen
            <>
              <h2 className={cn(
                "text-4xl md:text-5xl font-bold font-game tracking-wider",
                won ? "text-green-600" : "text-red-600"
              )}>
                {won ? 'SYSTEM SURVIVED' : 'COLLAPSE COMPLETE'}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="hud-panel p-4 bg-blue-50 border-blue-200">
                  <div className="text-xs text-gray-700">Final Score</div>
                  <div className="text-2xl font-bold hud-value text-gray-900">{score}</div>
                </div>
                <div className="hud-panel p-4 bg-blue-50 border-blue-200">
                  <div className="text-xs text-gray-700">Phase Reached</div>
                  <div className="text-2xl font-bold text-blue-600">{phaseConfig.name}</div>
                </div>
                <div className="hud-panel p-4 bg-blue-50 border-blue-200">
                  <div className="text-xs text-gray-700">Final Entropy</div>
                  <div className="text-2xl font-bold text-orange-600">{Math.round(entropy)}%</div>
                </div>
                <div className="hud-panel p-4 bg-blue-50 border-blue-200">
                  <div className="text-xs text-gray-700">Remaining Sanity</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    sanity > 30 ? "text-blue-600" : "text-red-600"
                  )}>
                    {Math.round(sanity)}%
                  </div>
                </div>
                <div className="hud-panel p-4 bg-blue-50 border-blue-200 col-span-2">
                  <div className="text-xs text-gray-700">Total Play Time</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPlayTime(playTimeSeconds)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleStartGame}
                  size="lg"
                  className="gap-2 font-game tracking-wider neon-glow"
                >
                  <RotateCcw className="w-5 h-5" />
                  PLAY AGAIN
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-2 font-game tracking-wider"
                >
                  <Link to="/analytics">
                    <BarChart3 className="w-5 h-5" />
                    VIEW STATS
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }, [isPlaying, score, entropy, sanity, handleStartGame, phaseConfig]);

  return (
    <div 
      className={cn(
        "min-h-screen bg-background grid-pattern relative",
        isPlaying ? "overflow-auto" : "overflow-hidden"
      )}
      style={backgroundStyle}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20",
          "bg-primary animate-float"
        )} />
        <div className={cn(
          "absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20",
          "bg-secondary animate-float",
          "animation-delay-1000"
        )} style={{ animationDelay: '1s' }} />
        {phase >= 3 && (
          <div className={cn(
            "absolute top-1/2 left-1/2 w-48 h-48 rounded-full blur-2xl opacity-30",
            "bg-destructive animate-pulse"
          )} />
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-4 lg:py-6 max-w-7xl">
        {/* Floating Control Buttons - Top Right */}
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={() => {
              initAudio();
              toggleMute();
            }}
            className="bg-background/80 backdrop-blur-sm border-primary/30 text-foreground hover:bg-primary/20 hover:border-primary shadow-lg"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setShowTutorial(true)}
            className="bg-background/80 backdrop-blur-sm border-primary/30 text-foreground hover:bg-primary/20 hover:border-primary shadow-lg"
            title="Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* HUD - Above instruction on mobile, right side on medium+ screens */}
        <div className="mb-4 md:hidden max-w-md mx-auto">
          <HUD 
            score={score}
            phase={phase}
            entropy={entropy}
            sanity={sanity}
            timeRemaining={timeRemaining}
            playTimeSeconds={playTimeSeconds}
            beatPulse={beatSync.beatPulse}
            isBeatDropped={beatSync.isBeatDropped}
          />
        </div>

        {/* Instruction - stays at top */}
        <div className="mb-4 lg:mb-3 max-w-lg mx-auto">
          <InstructionDisplay 
            instruction={currentInstruction}
            phase={phase}
            entropy={entropy}
            sanity={sanity}
            beatPulse={beatSync.beatPulse}
            isBeatDropped={beatSync.isBeatDropped}
          />
        </div>

        {/* Game Layout - Phase + Hint left, Grid center, HUD right for large screens */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-4 md:gap-6 lg:gap-8">
          {/* Left column - Phase box above System Hint */}
          <div className="md:order-1 md:w-56 lg:w-64 xl:w-72 order-2 w-full space-y-4">
            <div className="hidden md:block hud-panel p-3 text-center bg-blue-50 border-blue-300">
              <div className="text-xs text-gray-700 uppercase tracking-wider mb-1">Phase</div>
              <div className={cn(
                "font-bold text-sm",
                phase === 1 && "text-blue-600",
                phase === 2 && "text-orange-600",
                phase === 3 && "text-red-600",
                phase === 4 && "text-purple-600",
                phase === 5 && "text-red-600 animate-pulse"
              )}>
                {phaseConfig.name}
              </div>
            </div>
            <SystemHint 
              phase={phase}
              sanity={sanity}
              entropy={entropy}
              isPlaying={isPlaying}
              beatPulse={beatSync.beatPulse}
              isBeatDropped={beatSync.isBeatDropped}
            />
          </div>

          {/* Game Grid - Center */}
          <div className="md:order-2 flex justify-center order-1 w-full md:w-auto">
            <div className="w-full max-w-md md:w-[350px] lg:w-[400px]">
              <GameGrid 
                tiles={tiles}
                phase={phase}
                entropy={entropy}
                sanity={sanity}
                onTileClick={handleTileClickWithSound}
                beatPulse={beatSync.beatPulse}
                isExploding={beatSync.isExploding}
                scatterAmount={beatSync.scatterAmount}
                isBeatDropped={beatSync.isBeatDropped}
                isPreDrop={beatSync.isPreDrop}
              />
            </div>
          </div>

          {/* Right column - HUD (excluding Phase) */}
          <div className="hidden md:block md:order-3 md:w-56 lg:w-64 xl:w-72">
            <HUD 
              score={score}
              phase={phase}
              entropy={entropy}
              sanity={sanity}
              timeRemaining={timeRemaining}
              playTimeSeconds={playTimeSeconds}
              beatPulse={beatSync.beatPulse}
              isBeatDropped={beatSync.isBeatDropped}
              showPhase={false}
            />
          </div>
        </div>
      </div>

      {/* Game Over / Start Overlay */}
      <GameOverOverlay />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <Tutorial 
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
        />
      )}

      {/* Background Music */}
      <audio 
        ref={bgMusicRef}
        src="/audio/bg.webm"
        loop
        preload="auto"
      />

      {/* Flash effect at beat drop */}
      {beatSync.flashIntensity > 0 && isPlaying && (
        <div 
          className="fixed inset-0 pointer-events-none z-[100] bg-white animate-flash-bang"
          style={{ opacity: beatSync.flashIntensity }}
        />
      )}
    </div>
  );
};

export default GameScreen;
