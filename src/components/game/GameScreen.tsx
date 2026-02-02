/**
 * Main Game Screen Component
 * Orchestrates all game UI elements
 */

import { Button } from '@/components/ui/button';
import { GuidedTour, TourStep } from '@/components/ui/guided-tour';
import { useBeatSync } from '@/hooks/useBeatSync';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useGameState } from '@/hooks/useGameState.tsx';
import { cn } from '@/lib/utils';
import { BarChart3, HelpCircle, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GameGrid from './GameGrid';
import HUD from './HUD';
import InstructionDisplay from './InstructionDisplay';
import SystemHint from './SystemHint';
import Tutorial from './Tutorial';

const TUTORIAL_SEEN_KEY = 'rule-collapse-tutorial-seen';

export const GameScreen = () => {
  const { gameState, handleTileClick, startGame, phaseConfig } = useGameState();
  const { score, phase, entropy, sanity, timeRemaining, tiles, currentInstruction, isPlaying, collapseCount, isCollapsing } = gameState;
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
  });
  const [isGameOverBlast, setIsGameOverBlast] = useState(false);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(true);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isGameTourOpen, setIsGameTourOpen] = useState(false);
  const [isGamePausedForTour, setIsGamePausedForTour] = useState(false);
  
  const prevPhaseRef = useRef(phase);
  const prevCollapseCountRef = useRef(collapseCount);
  const wasCollapsingRef = useRef(isCollapsing);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const musicContextRef = useRef<AudioContext | null>(null);
  const musicSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const musicFilterRef = useRef<BiquadFilterNode | null>(null);
  const musicShaperRef = useRef<WaveShaperNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const hasPlayedFirstTile = useRef(false);
  const playStartRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  // Define mobile tour steps (for screens < 768px)
  const mobileTourSteps: TourStep[] = [
    {
      target: '[data-tour="game-instruction"]',
      title: 'Follow the Instruction 📝',
      content: 'This shows which color tile you should click. Pay attention - the rules will change as the game progresses!',
      position: 'bottom',
    },
    {
      target: '[data-tour="game-score game-entropy game-sanity game-timer"]',
      title: 'Game Stats HUD 📊',
      content: 'Track your Score, Entropy (chaos level), Sanity (mental health), and Time remaining. These metrics determine your progress and survival.',
      position: 'bottom',
    },
    {
      target: '[data-tour="game-grid"]',
      title: 'The Game Grid 🎮',
      content: 'Click on the colored tiles according to the instruction. Each click affects your score, entropy, and sanity.',
      position: 'bottom',
    },
    // {
    //   target: '[data-tour="game-phase"]',
    //   title: 'Current Phase 🎭',
    //   content: 'Shows which phase of system collapse you\'re in. Each phase has different rules and behavior.',
    //   position: 'bottom',
    // },
    {
      target: '[data-tour="game-hint"]',
      title: 'System Hints 💡',
      content: 'Helpful hints about the current game rules. These become more cryptic as chaos increases!',
      position: 'bottom',
    },
    {
      target: '[data-tour="game-collapse"]',
      title: 'Collapse Cycles 🔄',
      content: 'Tracks how many times entropy has cycled from 0 to 100. Each cycle makes the game more unpredictable.',
      position: 'top',
    },
  ];

  // Define desktop tour steps (for screens >= 768px)
  const desktopTourSteps: TourStep[] = [
    {
      target: '[data-tour="game-instruction"]',
      title: 'Follow the Instruction 📝',
      content: 'This shows which color tile you should click. Pay attention - the rules will change as the game progresses!',
      position: 'bottom',
    },
    {
      target: '[data-tour="game-phase"]',
      title: 'Current Phase 🎭',
      content: 'Shows which phase of system collapse you\'re in. Each phase has different rules and behavior.',
      position: 'right',
    },
    {
      target: '[data-tour="game-hint"]',
      title: 'System Hints 💡',
      content: 'Helpful hints about the current game rules. These become more cryptic as chaos increases!',
      position: 'right',
    },
    {
      target: '[data-tour="game-collapse"]',
      title: 'Collapse Cycles 🔄',
      content: 'Tracks how many times entropy has cycled from 0 to 100. Each cycle makes the game more unpredictable.',
      position: 'right',
    },
    {
      target: '[data-tour="game-grid"]',
      title: 'The Game Grid 🎮',
      content: 'Click on the colored tiles according to the instruction. Each click affects your score, entropy, and sanity.',
      position: 'top',
    },
    {
      target: '[data-tour="game-timer"]',
      title: 'Round Timer ⏱️',
      content: 'Time remaining for this round. Make a move before it runs out to avoid sanity loss!',
      position: 'left',
    },
    {
      target: '[data-tour="game-score"]',
      title: 'Your Score 🎯',
      content: 'Earn points by making correct clicks. The scoring rules evolve through different phases of the game.',
      position: 'left',
    },
    {
      target: '[data-tour="game-entropy"]',
      title: 'Entropy Meter 🌀',
      content: 'Measures how far into chaos you\'ve progressed. Higher entropy means more challenging gameplay and rule changes.',
      position: 'left',
    },
    {
      target: '[data-tour="game-sanity"]',
      title: 'Sanity Level 🧠',
      content: 'Your mental stability. It drains over time and with wrong clicks. When it reaches 0, game over!',
      position: 'left',
    },
    {
      target: '[data-tour="game-round-timer"]',
      title: 'Round Timer ⏱️',
      content: 'Time remaining for this round. Make a move before it runs out to avoid sanity loss!',
      position: 'left',
    },
  ];

  // Determine which tour to use based on screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const gameTourSteps = isMobile ? mobileTourSteps : desktopTourSteps;

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug: Check tour elements
  useEffect(() => {
    if (isPlaying) {
      console.log('🎯 TOUR DEBUG:');
      console.log('Screen width:', window.innerWidth, 'isMobile:', isMobile);
      console.log('Tour steps:', gameTourSteps.length);
      
      gameTourSteps.forEach((step, index) => {
        const element = document.querySelector(step.target);
        console.log(`Step ${index + 1} (${step.title}):`, {
          target: step.target,
          found: !!element,
          visible: element ? window.getComputedStyle(element).display !== 'none' : false,
          element: element
        });
      });
    }
  }, [isPlaying, isMobile, gameTourSteps]);
  
  // Beat synchronization
  const beatSync = useBeatSync(bgMusicRef);

  const createDistortionCurve = useCallback((amount: number) => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve;
  }, []);

  
  const {
    isMuted,
    initAudio,
    toggleMute,
    playTileClick,
    playPhaseTransition,
    playGameOver,
    playPhaseCycleChange,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateMusicForPhase,
  } = useGameAudio();

  // Initialize background music processing chain for distortion
  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio || musicContextRef.current || musicSourceRef.current) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const filter = ctx.createBiquadFilter();
    const shaper = ctx.createWaveShaper();
    const gain = ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.value = 20000;
    filter.Q.value = 0.7;

    shaper.curve = createDistortionCurve(0);
    shaper.oversample = '4x';

    gain.gain.value = 1;

    source.connect(filter);
    filter.connect(shaper);
    shaper.connect(gain);
    gain.connect(ctx.destination);

    musicContextRef.current = ctx;
    musicSourceRef.current = source;
    musicFilterRef.current = filter;
    musicShaperRef.current = shaper;
    musicGainRef.current = gain;

    return () => {
      try {
        source.disconnect();
        filter.disconnect();
        shaper.disconnect();
        gain.disconnect();
      } catch (error) {
        console.warn('Music audio graph cleanup failed:', error);
      }

      ctx.close().catch(() => undefined);
      musicContextRef.current = null;
      musicSourceRef.current = null;
      musicFilterRef.current = null;
      musicShaperRef.current = null;
      musicGainRef.current = null;
    };
  }, [createDistortionCurve]);

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

  // Update background music distortion based on phase
  useEffect(() => {
    const ctx = musicContextRef.current;
    const filter = musicFilterRef.current;
    const shaper = musicShaperRef.current;
    const gain = musicGainRef.current;

    if (!ctx || !filter || !shaper || !gain) return;

    const phaseIndex = Math.max(0, phase - 1);
    const easedPhase = phaseIndex * phaseIndex;
    const distortionAmount = Math.max(0, phaseIndex - 1) * 50 + phaseIndex * 8;
    const cutoff = Math.max(1400, 19000 - easedPhase * 2800);
    const qValue = 0.6 + phaseIndex * 0.6;
    const gainValue = isMuted ? 0 : 1;

    shaper.curve = createDistortionCurve(distortionAmount);
    filter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.18);
    filter.Q.setTargetAtTime(qValue, ctx.currentTime, 0.18);
    gain.gain.setTargetAtTime(gainValue, ctx.currentTime, 0.18);
  }, [phase, isMuted, createDistortionCurve]);

  // Handle game start/end for audio
  useEffect(() => {
    if (isPlaying) {
      startBackgroundMusic();
      setShowGameOverOverlay(false);
      setIsGameOverBlast(false);
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

  // Play sound at the start of a collapse cycle for sync with visuals
  useEffect(() => {
    if (!isPlaying) {
      prevCollapseCountRef.current = collapseCount;
      wasCollapsingRef.current = isCollapsing;
      return;
    }

    if (!wasCollapsingRef.current && isCollapsing) {
      playPhaseCycleChange();
    }

    wasCollapsingRef.current = isCollapsing;
    prevCollapseCountRef.current = collapseCount;
  }, [collapseCount, isCollapsing, isPlaying, playPhaseCycleChange]);

  // Game-over blast transition before summary
  useEffect(() => {
    if (!isPlaying && (score !== 0 || entropy !== 0)) {
      setShowGameOverOverlay(false);
      setIsGameOverBlast(true);
      const timeout = setTimeout(() => {
        setIsGameOverBlast(false);
        setShowGameOverOverlay(true);
      }, 700);
      return () => clearTimeout(timeout);
    }

    if (!isPlaying && score === 0 && entropy === 0) {
      setShowGameOverOverlay(true);
      setIsGameOverBlast(false);
    }

    return undefined;
  }, [isPlaying, score, entropy]);

  // Handle muting the background music
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-start game on mount
  useEffect(() => {
    if (!isPlaying && score === 0 && entropy === 0) {
      // Auto-start the game directly
      handleStartGame();
      setHasSeenTutorial(true);
      localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    }
  }, []); // Run only once on mount

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

  const handleStartGameTour = useCallback(() => {
    if (isPlaying) {
      // Pause the game
      setIsGamePausedForTour(true);
      setTimerActive(false);
      if (playStartRef.current && !pauseStartRef.current) {
        pauseStartRef.current = Date.now();
      }
    }
    setIsGameTourOpen(true);
  }, [isPlaying]);

  const handleGameTourClose = useCallback(() => {
    setIsGameTourOpen(false);
    if (isPlaying && isGamePausedForTour) {
      // Resume the game
      setIsGamePausedForTour(false);
      setTimerActive(true);
      if (pauseStartRef.current && playStartRef.current) {
        const pauseDuration = Date.now() - pauseStartRef.current;
        playStartRef.current += pauseDuration;
        pauseStartRef.current = null;
      }
    }
  }, [isPlaying, isGamePausedForTour]);

  const handleStartGame = useCallback(() => {
    initAudio();
    setPlayTimeSeconds(0);
    playStartRef.current = null;
    setTimerActive(false);
    pauseStartRef.current = null;
    pausedTimeRef.current = 0;
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
    } else if (!isPlaying && playStartRef.current) {
      // Game ended - capture final time and preserve it
      const elapsed = (Date.now() - playStartRef.current) / 1000;
      setPlayTimeSeconds(elapsed);
      playStartRef.current = null;
      setTimerActive(false);
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
    // Prevent clicks during tour
    if (isGamePausedForTour) return;
    
    // Start background music on first tile click
    if (!hasPlayedFirstTile.current && bgMusicRef.current) {
      if (musicContextRef.current?.state === 'suspended') {
        musicContextRef.current.resume().catch(() => undefined);
      }
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
  }, [tiles, gameState.secretCorrectColor, phase, playTileClick, handleTileClick, isGamePausedForTour]);

  // Background chaos effects
  const backgroundStyle = useMemo(() => {
    return {
      filter: phase >= 3 ? `hue-rotate(${entropy * 0.5}deg)` : undefined,
      opacity: phaseConfig.visualEffects.opacity,
    };
  }, [phase, entropy, phaseConfig]);

  // Container style for explosion/scatter effects
  // @ts-ignore - Style prepared for future implementation
  const _containerStyle = useMemo(() => {
    const scatterStyles: React.CSSProperties = {};
    
    if (beatSync.isExploding) {
      // Generate random scatter values for explosion effect
      const angle = Math.random() * Math.PI * 2;
      const distance = beatSync.scatterAmount;
      (scatterStyles as any)['--scatter-x'] = `${Math.cos(angle) * distance}px`;
      (scatterStyles as any)['--scatter-y'] = `${Math.sin(angle) * distance}px`;
      (scatterStyles as any)['--scatter-rotate'] = `${(Math.random() - 0.5) * 180}deg`;
    }
    
    return scatterStyles;
  }, [beatSync.isExploding, beatSync.scatterAmount]);

  const getBlastStyle = useCallback((): React.CSSProperties => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 180 + Math.random() * 140;
    return {
      '--scatter-x': `${Math.cos(angle) * distance}px`,
      '--scatter-y': `${Math.sin(angle) * distance}px`,
      '--scatter-rotate': `${(Math.random() - 0.5) * 360}deg`,
    } as React.CSSProperties;
  }, []);

  // Game over screen
  const GameOverOverlay = useCallback(() => {
    if (isPlaying || !showGameOverOverlay) return null;
    
    // Determine win condition: Score > 200 AND completed 3+ collapse cycles
    const won = score > 200 && collapseCount >= 3;
    
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 animate-fade-in flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-2xl w-full">
          {score === 0 && entropy === 0 ? (
            // Start screen
            <>
              
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
                <div className="hud-panel p-4 bg-orange-50 border-orange-300">
                  <div className="text-xs text-gray-700">Collapse Cycles</div>
                  <div className="text-2xl font-bold text-orange-600">{collapseCount}</div>
                </div>
                <div className="hud-panel p-4 bg-blue-50 border-blue-200">
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
  }, [isPlaying, showGameOverOverlay, score, entropy, sanity, handleStartGame, phaseConfig, collapseCount, playTimeSeconds]);

  return (
    <>
      {/* Floating Control Buttons - Only show when game is playing */}
      {isPlaying && (
        <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2">
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
            onClick={handleStartGameTour}
            className="bg-background/80 backdrop-blur-sm border-primary/30 text-foreground hover:bg-primary/20 hover:border-primary shadow-lg"
            title="Game Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div 
        className={cn(
          "min-h-screen bg-background grid-pattern relative overflow-x-hidden",
          isPlaying ? "overflow-y-auto" : "overflow-hidden"
        )}
        style={backgroundStyle}
      >
        {/* Animated background elements */}
        {isPlaying && (
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
        )}

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-2 md:py-4 lg:py-6 max-w-7xl min-h-screen md:min-h-0">

        {/* Pause Overlay when tour is active */}
        {isGamePausedForTour && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg border-2 border-primary shadow-2xl">
              <p className="text-3xl font-bold text-white neon-text animate-pulse">
                ⏸️ GAME PAUSED
              </p>
              <p className="text-sm text-gray-200 text-center mt-2">
                Tour in progress
              </p>
            </div>
          </div>
        )}

        {/* HUD - Fixed at top on mobile, right side on medium+ screens */}
        {isPlaying && (
          <div
            className={cn(
              "md:hidden fixed left-0 right-0 z-[120] bg-background/95 backdrop-blur-sm shadow-lg px-2 py-1.5",
              isGameOverBlast && "animate-explosion-scatter"
            )}
            style={isGameOverBlast ? getBlastStyle() : undefined}
          >
            <div className="max-w-md mx-auto space-y-1">
              {/* Instruction on mobile - compact */}
              <div data-tour="game-instruction" className="mb-1">
                <div className="hud-panel p-1.5 text-center bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-0.5">Instruction</div>
                  <div className={cn(
                    "font-bold text-sm",
                    currentInstruction.includes('GREEN') && "text-green-600",
                    currentInstruction.includes('BLUE') && "text-blue-600",
                    currentInstruction.includes('RED') && "text-red-600",
                    currentInstruction.includes('YELLOW') && "text-yellow-600"
                  )}>
                    {currentInstruction}
                  </div>
                </div>
              </div>
              {/* HUD Stats */}
              <div data-tour="game-score game-entropy game-sanity game-timer">
                <HUD 
                  score={score}
                  phase={phase}
                  entropy={entropy}
                  sanity={sanity}
                  timeRemaining={timeRemaining}
                  playTimeSeconds={playTimeSeconds}
                  beatPulse={beatSync.beatPulse}
                  isBeatDropped={beatSync.isBeatDropped}
                  collapseCount={collapseCount}
                  isMobile={true}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Spacer for fixed HUD on mobile */}
        {isPlaying && <div className="md:hidden h-24" />}

        {/* Instruction - stays at top (hidden on mobile, shown on tablet+) */}
        <div
          className={cn(
            "mb-2 md:mb-4 lg:mb-3 max-w-lg mx-auto hidden md:block",
            isGameOverBlast && "animate-explosion-scatter"
          )}
          style={isGameOverBlast ? getBlastStyle() : undefined}
          data-tour="game-instruction"
        >
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
        <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-0 md:gap-6 lg:gap-8">
          {/* Left column - Phase box above System Hint */}
          <div
            className={cn(
              "md:order-1 md:w-56 lg:w-64 xl:w-72 order-2 w-full space-y-4 hidden md:block",
              isGameOverBlast && "animate-explosion-scatter"
            )}
            style={isGameOverBlast ? getBlastStyle() : undefined}
          >
            <div className="hidden md:block hud-panel p-3 text-center bg-blue-50 border-blue-300" data-tour="game-phase">
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
            <div data-tour="game-hint">
              <SystemHint 
                phase={phase}
                sanity={sanity}
                entropy={entropy}
                isPlaying={isPlaying}
                beatPulse={beatSync.beatPulse}
                isBeatDropped={beatSync.isBeatDropped}
              />
            </div>
            {/* Collapse Cycles Box */}
            <div className="hud-panel p-3 text-center bg-orange-50 border-orange-300" data-tour="game-collapse">
              <div className="text-xs text-gray-700 uppercase tracking-wider mb-1">Collapse Cycles</div>
              <div className="font-bold text-2xl text-orange-600">
                {collapseCount === 0 ? '--' : collapseCount}
              </div>
            </div>
          </div>

          {/* Game Grid - Center */}
          <div
            className={cn(
              "md:order-2 flex justify-center order-1 w-full md:w-auto",
              isGameOverBlast && "animate-explosion-scatter"
            )}
            style={isGameOverBlast ? getBlastStyle() : undefined}
            data-tour="game-grid"
          >
            <div className="w-full px-3 max-w-[min(85vw,320px)] sm:max-w-sm md:max-w-md md:w-[300px] lg:w-[400px] mt-[11rem] md:mt-0">
              <GameGrid 
                tiles={tiles}
                phase={phase}
                entropy={entropy}
                sanity={sanity}
                onTileClick={handleTileClickWithSound}
                beatPulse={beatSync.beatPulse}
                beatIntensity={beatSync.beatIntensity}
                gridShake={beatSync.gridShake}
                glowIntensity={beatSync.glowIntensity}
                isExploding={beatSync.isExploding || isGameOverBlast}
                scatterAmount={isGameOverBlast ? 220 : beatSync.scatterAmount}
                isBeatDropped={beatSync.isBeatDropped}
                isPreDrop={beatSync.isPreDrop}
                isCollapsing={isCollapsing}
              />
            </div>
          </div>

          {/* Right column - HUD (excluding Phase) */}
          <div
            className={cn(
              "hidden md:block md:order-3 md:w-56 lg:w-64 xl:w-72",
              isGameOverBlast && "animate-explosion-scatter"
            )}
            style={isGameOverBlast ? getBlastStyle() : undefined}
          >
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
              collapseCount={collapseCount}
              enableTourTargets={true}
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
        src="/audio/game_bg.mp4"
        loop
        preload="auto"
      />

      {/* RGB Glow overlay for beat intensity (on grid background) */}
      {beatSync.glowIntensity > 0 && isPlaying && (
        <div className="fixed inset-0 pointer-events-none z-[95]">
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, rgba(255, 0, 255, ${beatSync.glowIntensity * 0.1}), rgba(0, 255, 255, ${beatSync.glowIntensity * 0.05}), transparent)`,
              opacity: beatSync.glowIntensity,
            }}
          />
        </div>
      )}

      {/* Collapse Animation Overlay */}
      {isCollapsing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden pointer-events-none"
             style={{
               animation: 'screen-shake 0.3s infinite, screen-glitch 0.15s infinite',
             }}>
          {/* Minimal content - just text */}
          <div className="relative z-20 text-center space-y-8 px-4">
            {/* Title with intense glitch */}
            <div className="relative"
                 style={{
                   animation: 'text-glitch 0.2s infinite',
                 }}>
              <h2 className="text-7xl md:text-9xl font-bold font-game tracking-wider text-red-600"
                  style={{
                    textShadow: '3px 3px 0 cyan, -3px -3px 0 yellow, 5px -5px 0 magenta',
                    animation: 'color-shift 0.1s infinite',
                  }}>
                SYSTEM
              </h2>
            </div>
            
            <div className="relative"
                 style={{
                   animation: 'text-glitch 0.2s infinite',
                   animationDelay: '0.1s',
                 }}>
              <h2 className="text-7xl md:text-9xl font-bold font-game tracking-wider text-blue-600"
                  style={{
                    textShadow: '-3px 3px 0 lime, 3px -3px 0 magenta, -5px 5px 0 cyan',
                    animation: 'color-shift 0.1s infinite',
                    animationDelay: '0.05s',
                  }}>
                COLLAPSE
              </h2>
            </div>
            
            {/* Cycle counter - no background */}
            <div className="relative mt-12"
                 style={{
                   animation: 'text-glitch 0.15s infinite',
                 }}>
              <div className="text-sm text-purple-600 uppercase tracking-[0.3em] mb-3 font-bold"
                   style={{ textShadow: '2px 2px 0 cyan, -2px -2px 0 yellow' }}>
                Collapse Cycle
              </div>
              <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-purple-600"
                   style={{
                     textShadow: '5px 5px 0 cyan, -5px -5px 0 yellow',
                     WebkitTextStroke: '2px red',
                   }}>
                {collapseCount + 1}
              </div>
            </div>
          </div>

          {/* Add CSS animations via style tag */}
          <style>{`
            @keyframes screen-shake {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              10% { transform: translate(-10px, -10px) rotate(-1deg); }
              20% { transform: translate(10px, 5px) rotate(1deg); }
              30% { transform: translate(-5px, 10px) rotate(-0.5deg); }
              40% { transform: translate(8px, -8px) rotate(0.5deg); }
              50% { transform: translate(-8px, 8px) rotate(-1deg); }
              60% { transform: translate(5px, -5px) rotate(1deg); }
              70% { transform: translate(-10px, 5px) rotate(-0.5deg); }
              80% { transform: translate(10px, -10px) rotate(0.5deg); }
              90% { transform: translate(-5px, -5px) rotate(-1deg); }
            }
            
            @keyframes screen-glitch {
              0%, 100% { filter: none; }
              10% { filter: hue-rotate(90deg) saturate(3); }
              20% { filter: hue-rotate(-90deg) saturate(3); }
              30% { filter: invert(1); }
              40% { filter: hue-rotate(180deg) saturate(5); }
              50% { filter: brightness(2) contrast(3); }
              60% { filter: hue-rotate(-180deg) saturate(3); }
              70% { filter: invert(0.5) hue-rotate(90deg); }
              80% { filter: brightness(0.5) contrast(5); }
              90% { filter: hue-rotate(270deg) saturate(3); }
            }
            
            @keyframes text-glitch {
              0%, 100% { transform: translate(0, 0) skew(0deg); opacity: 1; }
              10% { transform: translate(-5px, 2px) skew(-2deg); opacity: 0.8; }
              20% { transform: translate(5px, -2px) skew(2deg); opacity: 0.9; }
              30% { transform: translate(-3px, -3px) skew(1deg); opacity: 0.7; }
              40% { transform: translate(3px, 3px) skew(-1deg); opacity: 0.85; }
              50% { transform: translate(-2px, 2px) skew(-2deg); opacity: 0.9; }
              60% { transform: translate(2px, -2px) skew(2deg); opacity: 0.8; }
              70% { transform: translate(-4px, 1px) skew(1deg); opacity: 0.75; }
              80% { transform: translate(4px, -1px) skew(-1deg); opacity: 0.9; }
              90% { transform: translate(-1px, -1px) skew(-2deg); opacity: 0.85; }
            }
            
            @keyframes color-shift {
              0% { filter: hue-rotate(0deg); }
              25% { filter: hue-rotate(90deg); }
              50% { filter: hue-rotate(180deg); }
              75% { filter: hue-rotate(270deg); }
              100% { filter: hue-rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Game Guided Tour */}
      {isPlaying && (
        <GuidedTour
          steps={gameTourSteps}
          storageKey="game-tour-completed"
          isOpen={isGameTourOpen}
          onComplete={() => {
            console.log('Game tour completed!');
            handleGameTourClose();
          }}
          onSkip={() => {
            console.log('Game tour skipped');
            handleGameTourClose();
          }}
          onClose={handleGameTourClose}
        />
      )}
      </div>
    </>
  );
};
export default GameScreen;
