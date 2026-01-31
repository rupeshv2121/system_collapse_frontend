/**
 * Main Game Screen Component
 * Orchestrates all game UI elements
 */

import { Button } from '@/components/ui/button';
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
  
  const prevPhaseRef = useRef(phase);
  
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
      if (score !== 0 || entropy !== 0) {
        const won = score > 50 && entropy >= 100;
        playGameOver(won);
      }
    }
  }, [isPlaying, score, entropy, startBackgroundMusic, stopBackgroundMusic, playGameOver]);

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
    startGame();
  }, [initAudio, startGame]);

  const handleTileClickWithSound = useCallback((tileId: number) => {
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
              <h1 className="text-4xl md:text-6xl font-bold font-game neon-text tracking-wider">
                SYSTEM COLLAPSE
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
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
                won ? "text-success neon-text" : "text-destructive neon-glow-danger"
              )}>
                {won ? 'SYSTEM SURVIVED' : 'COLLAPSE COMPLETE'}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="hud-panel p-4">
                  <div className="text-xs text-muted-foreground">Final Score</div>
                  <div className="text-2xl font-bold hud-value">{score}</div>
                </div>
                <div className="hud-panel p-4">
                  <div className="text-xs text-muted-foreground">Phase Reached</div>
                  <div className="text-2xl font-bold text-secondary">{phaseConfig.name}</div>
                </div>
                <div className="hud-panel p-4">
                  <div className="text-xs text-muted-foreground">Final Entropy</div>
                  <div className="text-2xl font-bold text-accent">{Math.round(entropy)}%</div>
                </div>
                <div className="hud-panel p-4">
                  <div className="text-xs text-muted-foreground">Remaining Sanity</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    sanity > 30 ? "text-primary" : "text-destructive"
                  )}>
                    {Math.round(sanity)}%
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
        {/* Header */}
        <header className="flex items-center justify-between mb-4 lg:mb-3">
          <h1 className={cn(
            "text-xl md:text-2xl font-bold font-game tracking-wider text-foreground",
            phase >= 5 && "glitch-text animate-flicker"
          )} data-text="RULE COLLAPSE">
            RULE COLLAPSE
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => {
                initAudio();
                toggleMute();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowTutorial(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button 
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 font-game"
            >
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* HUD - Above instruction on mobile, right side on medium+ screens */}
        <div className="mb-4 md:hidden max-w-md mx-auto">
          <HUD 
            score={score}
            phase={phase}
            entropy={entropy}
            sanity={sanity}
            timeRemaining={timeRemaining}
          />
        </div>

        {/* Instruction - stays at top */}
        <div className="mb-4 lg:mb-3 max-w-lg mx-auto">
          <InstructionDisplay 
            instruction={currentInstruction}
            phase={phase}
            entropy={entropy}
            sanity={sanity}
          />
        </div>

        {/* Game Layout - Grid with Hint on left and HUD on right for large screens */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-evenly gap-4 md:gap-4 lg:gap-6">
          {/* System Hint - Left side on medium+ screens, below grid on mobile */}
          <div className="md:order-1 md:w-48 lg:w-64 xl:w-72 order-2 w-full md:mx-0">
            <SystemHint 
              phase={phase}
              sanity={sanity}
              entropy={entropy}
              isPlaying={isPlaying}
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
              />
            </div>
          </div>

          {/* HUD - Right side on medium+ screens, hidden on mobile (shown above instruction) */}
          <div className="hidden md:block md:order-3 md:w-48 lg:w-64 xl:w-72">
            <HUD 
              score={score}
              phase={phase}
              entropy={entropy}
              sanity={sanity}
              timeRemaining={timeRemaining}
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
    </div>
  );
};

export default GameScreen;
