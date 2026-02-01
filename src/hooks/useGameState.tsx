/**
 * Core game state management hook
 * Handles all game logic, phase transitions, and scoring
 */

import {
  ClickRecord,
  COLORS,
  GamePhase,
  GameState,
  PHASE_CONFIGS,
  TileColor,
  TileState,
} from '@/types/game';
import { BehaviorMetrics } from '@/types/userData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStats } from './useGameStats';
import { useUserData } from './useUserData';

const GRID_SIZE = 4;
const INITIAL_SANITY = 100;
const INITIAL_TIME = 10;

// Generate random tile colors for the 4x4 grid
const generateTiles = (): TileState[] => {
  const tiles: TileState[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      tiles.push({
        id: row * GRID_SIZE + col,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: { row, col },
        isShaking: false,
        rotation: 0,
        drift: { x: 0, y: 0 },
      });
    }
  }
  return tiles;
};

const getRandomColor = (): TileColor => COLORS[Math.floor(Math.random() * COLORS.length)];

const getInitialState = (): GameState => {
  const instructionColor = getRandomColor();
  return {
    score: 0,
    phase: 1,
    entropy: 0,
    sanity: INITIAL_SANITY,
    timeRemaining: INITIAL_TIME,
    clickHistory: [],
    currentInstruction: instructionColor,
    secretCorrectColor: instructionColor, // Initially matches instruction
    tiles: generateTiles(),
    isPlaying: false,
    roundStartTime: Date.now(),
    lastClickTime: Date.now(),
    consecutiveSameColor: 0,
    uniqueColorsClicked: new Set<TileColor>(),
    gameStartTime: Date.now(),
    timerStarted: false,
    collapseCount: 0,
    isCollapsing: false,
  };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { recordGameEnd } = useGameStats();
  const { recordSession } = useUserData();
  const gameStartTimeRef = useRef<number>(Date.now());
  const hintsIgnoredRef = useRef<number>(0);

  // Determine current phase based on entropy
  const calculatePhase = useCallback((entropy: number): GamePhase => {
    if (entropy >= PHASE_CONFIGS[5].entropyThreshold) return 5;
    if (entropy >= PHASE_CONFIGS[4].entropyThreshold) return 4;
    if (entropy >= PHASE_CONFIGS[3].entropyThreshold) return 3;
    if (entropy >= PHASE_CONFIGS[2].entropyThreshold) return 2;
    return 1;
  }, []);

  // Calculate score change based on current phase and click
  const calculateScoreChange = useCallback(
    (clickedColor: TileColor, state: GameState): number => {
      const { phase, secretCorrectColor, lastClickTime, consecutiveSameColor, uniqueColorsClicked } = state;
      const responseTime = Date.now() - state.roundStartTime;
      const isFastClick = responseTime < 1500;
      const isCorrectByInstruction = clickedColor === state.currentInstruction;
      const isCorrectBySecret = clickedColor === secretCorrectColor;

      switch (phase) {
        case 1:
          // Phase 1: Simple - instruction is truth
          return isCorrectByInstruction ? 10 : -5;

        case 2:
          // Phase 2: Secret color matters, not instruction
          return isCorrectBySecret ? 15 : -8;

        case 3:
          // Phase 3: Inversion - "correct" is wrong
          return isCorrectByInstruction ? -15 : 12;

        case 4:
          // Phase 4: Behavior-based scoring
          let score = 0;
          
          // Fast clicks rewarded
          if (isFastClick) score += 8;
          
          // Repetition punished
          if (consecutiveSameColor > 2) score -= 10;
          
          // Variety rewarded
          if (uniqueColorsClicked.size >= 3) score += 5;
          
          return score || (Math.random() > 0.5 ? 5 : -5);

        case 5:
          // Phase 5: Chaos - semi-random with bias
          const chaos = Math.random();
          if (chaos > 0.7) return Math.floor(Math.random() * 30) - 10;
          return isCorrectBySecret ? 20 : -15;

        default:
          return 0;
      }
    },
    []
  );

  // Handle tile click
  const handleTileClick = useCallback(
    (tileId: number) => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.isCollapsing) return prev;

        const clickedTile = prev.tiles.find((t) => t.id === tileId);
        if (!clickedTile) return prev;

        // Start timer on first tile click
        const newTimerStarted = prev.timerStarted || true;

        const clickedColor = clickedTile.color;
        const responseTime = Date.now() - prev.roundStartTime;
        const scoreChange = calculateScoreChange(clickedColor, prev);
        const wasCorrect = scoreChange > 0;

        // Create click record
        const clickRecord: ClickRecord = {
          timestamp: Date.now(),
          color: clickedColor,
          tileId,
          wasCorrect,
          responseTime,
        };

        // Update entropy based on phase and behavior
        let entropyIncrease = 2 + prev.phase;
        if (responseTime < 1000) entropyIncrease += 1;
        if (!wasCorrect) entropyIncrease += 2;

        const newEntropy = Math.min(100, prev.entropy + entropyIncrease);
        const newPhase = calculatePhase(newEntropy);

        // Update sanity - increase drain with each collapse cycle
        const collapsePenalty = prev.collapseCount * 0.5; // Additional 0.5 sanity loss per collapse cycle
        let sanityChange = wasCorrect ? 0.5 : -(PHASE_CONFIGS[prev.phase].sanityDrainRate + collapsePenalty);
        const newSanity = Math.max(0, Math.min(100, prev.sanity + sanityChange));

        // Track consecutive same color clicks
        const lastClick = prev.clickHistory[prev.clickHistory.length - 1];
        const newConsecutive =
          lastClick?.color === clickedColor ? prev.consecutiveSameColor + 1 : 1;

        // Track color variety
        const newUniqueColors = new Set(prev.uniqueColorsClicked);
        newUniqueColors.add(clickedColor);

        // Update secret correct color on phase change
        let newSecretColor = prev.secretCorrectColor;
        if (newPhase !== prev.phase) {
          // Shift the secret color on phase change
          const currentIndex = COLORS.indexOf(prev.secretCorrectColor);
          newSecretColor = COLORS[(currentIndex + 1) % COLORS.length];
        }

        // Apply chaos effects to tiles in phase 5
        let newTiles = [...prev.tiles];
        if (newPhase >= 5 && Math.random() > 0.5) {
          // Randomly swap or mutate tiles
          const randomIndex = Math.floor(Math.random() * newTiles.length);
          newTiles[randomIndex] = {
            ...newTiles[randomIndex],
            color: getRandomColor(),
            isShaking: true,
            drift: {
              x: (Math.random() - 0.5) * 20,
              y: (Math.random() - 0.5) * 20,
            },
          };
        }

        // Generate new tiles and instruction for next round
        const newInstruction = getRandomColor();
        
        return {
          ...prev,
          score: prev.score + scoreChange,
          entropy: newEntropy,
          phase: newPhase,
          sanity: newSanity,
          clickHistory: [...prev.clickHistory, clickRecord],
          consecutiveSameColor: newConsecutive,
          uniqueColorsClicked: newUniqueColors,
          lastClickTime: Date.now(),
          secretCorrectColor: newSecretColor,
          tiles: newPhase >= 5 ? newTiles : generateTiles(),
          currentInstruction: newInstruction,
          timeRemaining: PHASE_CONFIGS[newPhase].timerDuration,
          roundStartTime: Date.now(),
          timerStarted: newTimerStarted,
        };
      });
    },
    [calculateScoreChange, calculatePhase]
  );

  // Start game
  const startGame = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    hintsIgnoredRef.current = 0;
    setGameState({
      ...getInitialState(),
      isPlaying: true,
      gameStartTime: Date.now(),
    });
  }, []);

  // End game
  const endGame = useCallback(
    (won: boolean) => {
      setGameState((prev) => {
        const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        
        // Extract click sequence colors
        const clickSequence = prev.clickHistory.map(click => click.color);
        
        // Calculate behavior metrics
        const totalClicks = prev.clickHistory.length;
        const clickTimes = prev.clickHistory.map(c => c.responseTime);
        const averageClickSpeed = clickTimes.length > 0 
          ? clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length 
          : 0;
        
        // Count color frequencies
        const colorCounts: Record<TileColor, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
        clickSequence.forEach(color => colorCounts[color]++);
        const mostClickedColor = Object.entries(colorCounts).reduce((a, b) => 
          b[1] > a[1] ? b : a
        )[0] as TileColor;
        
        // Calculate repetition (consecutive same color)
        let maxRepetition = 0;
        let currentRepetition = 1;
        for (let i = 1; i < clickSequence.length; i++) {
          if (clickSequence[i] === clickSequence[i - 1]) {
            currentRepetition++;
            maxRepetition = Math.max(maxRepetition, currentRepetition);
          } else {
            currentRepetition = 1;
          }
        }
        
        // Calculate variety score (unique colors / total clicks)
        const uniqueColors = new Set(clickSequence).size;
        const varietyScore = totalClicks > 0 ? (uniqueColors / totalClicks) * 100 : 50;
        
        // Calculate hesitation (slower clicks) vs impulsivity (faster clicks)
        const fastClicks = clickTimes.filter(t => t < 1000).length;
        const slowClicks = clickTimes.filter(t => t > 3000).length;
        const hesitationScore = totalClicks > 0 ? (slowClicks / totalClicks) * 100 : 50;
        const impulsivityScore = totalClicks > 0 ? (fastClicks / totalClicks) * 100 : 50;
        
        // Pattern adherence (how often they follow patterns)
        const correctClicks = prev.clickHistory.filter(c => c.wasCorrect).length;
        const patternAdherence = totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 50;
        
        // Rules followed/broken (based on score changes)
        const rulesFollowed = prev.clickHistory.filter(c => c.wasCorrect).length;
        const rulesBroken = totalClicks - rulesFollowed;
        
        const behaviorMetrics: BehaviorMetrics = {
          totalClicks,
          averageClickSpeed,
          mostClickedColor,
          repetitionCount: maxRepetition,
          varietyScore: Math.round(varietyScore),
          hesitationScore: Math.round(hesitationScore),
          impulsivityScore: Math.round(impulsivityScore),
          patternAdherence: Math.round(patternAdherence),
        };
        
        // Record to game stats (for charts)
        recordGameEnd({
          won,
          finalScore: prev.score,
          finalEntropy: prev.entropy,
          finalSanity: prev.sanity,
          phaseReached: prev.phase,
        });
        
        // Record to user data (for psychological profiling)
        recordSession({
          finalScore: prev.score,
          finalPhase: prev.phase,
          maxEntropyReached: prev.entropy,
          sanityRemaining: prev.sanity,
          duration: gameDuration,
          win: won,
          clickSequence,
          rulesFollowed,
          rulesBroken,
          hintsIgnored: hintsIgnoredRef.current,
          behaviorMetrics,
          collapseCount: prev.collapseCount,
        });
        
        // Reset tracking refs for next game
        gameStartTimeRef.current = Date.now();
        hintsIgnoredRef.current = 0;
        
        return { ...prev, isPlaying: false };
      });
    },
    [recordGameEnd, recordSession]
  );

  // Timer effect
  useEffect(() => {
    if (!gameState.isPlaying || !gameState.timerStarted || gameState.isCollapsing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isPlaying) return prev;

        const newTime = prev.timeRemaining - 0.1;

        if (newTime <= 0) {
          // Time ran out - penalize player with increased penalty based on collapse count
          const collapsePenalty = prev.collapseCount * 0.5;
          const sanityLoss = (PHASE_CONFIGS[prev.phase].sanityDrainRate * 2) + collapsePenalty;
          const newSanity = Math.max(0, prev.sanity - sanityLoss);
          const entropyGain = 5;
          const newEntropy = Math.min(100, prev.entropy + entropyGain);
          const newPhase = calculatePhase(newEntropy);

          // Check for game over (only if sanity is 0)
          if (newSanity <= 0) {
            return { ...prev, isPlaying: false, sanity: 0 };
          }

          return {
            ...prev,
            timeRemaining: PHASE_CONFIGS[newPhase].timerDuration,
            sanity: newSanity,
            entropy: newEntropy,
            phase: newPhase,
            score: prev.score - 5,
            tiles: generateTiles(),
            currentInstruction: getRandomColor(),
            roundStartTime: Date.now(),
          };
        }

        return { ...prev, timeRemaining: newTime };
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isPlaying, gameState.timerStarted, gameState.isCollapsing, calculatePhase]);

  // Check for game over conditions and collapse cycles
  useEffect(() => {
    if (gameState.isPlaying) {
      if (gameState.sanity <= 0) {
        // Calculate win condition: Score > 200 AND 3+ collapse cycles
        const won = gameState.score > 200 && gameState.collapseCount >= 3;
        endGame(won);
      } else if (gameState.entropy >= 100 && !gameState.isCollapsing) {
        // Trigger collapse animation
        setGameState(prev => ({ ...prev, isCollapsing: true }));
        
        // After collapse animation (2 seconds), reset entropy and continue
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            entropy: 0,
            phase: 1,
            collapseCount: prev.collapseCount + 1,
            isCollapsing: false,
            tiles: generateTiles(),
            currentInstruction: getRandomColor(),
            secretCorrectColor: getRandomColor(),
            timeRemaining: PHASE_CONFIGS[1].timerDuration,
            roundStartTime: Date.now(),
          }));
        }, 2000);
      }
    }
  }, [gameState.sanity, gameState.entropy, gameState.isPlaying, gameState.isCollapsing, endGame]);

  return {
    gameState,
    handleTileClick,
    startGame,
    endGame,
    phaseConfig: PHASE_CONFIGS[gameState.phase],
  };
};
