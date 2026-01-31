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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStats } from './useGameStats';

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
  };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { recordGameEnd } = useGameStats();

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
        if (!prev.isPlaying) return prev;

        const clickedTile = prev.tiles.find((t) => t.id === tileId);
        if (!clickedTile) return prev;

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

        // Update sanity
        let sanityChange = wasCorrect ? 2 : -PHASE_CONFIGS[prev.phase].sanityDrainRate;
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
        };
      });
    },
    [calculateScoreChange, calculatePhase]
  );

  // Start game
  const startGame = useCallback(() => {
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
        recordGameEnd({
          won,
          finalScore: prev.score,
          finalEntropy: prev.entropy,
          finalSanity: prev.sanity,
          phaseReached: prev.phase,
        });
        return { ...prev, isPlaying: false };
      });
    },
    [recordGameEnd]
  );

  // Timer effect
  useEffect(() => {
    if (!gameState.isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isPlaying) return prev;

        const newTime = prev.timeRemaining - 0.1;

        if (newTime <= 0) {
          // Time ran out - penalize player
          const sanityLoss = PHASE_CONFIGS[prev.phase].sanityDrainRate * 2;
          const newSanity = Math.max(0, prev.sanity - sanityLoss);
          const entropyGain = 5;
          const newEntropy = Math.min(100, prev.entropy + entropyGain);
          const newPhase = calculatePhase(newEntropy);

          // Check for game over
          if (newSanity <= 0 || newEntropy >= 100) {
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
  }, [gameState.isPlaying, calculatePhase]);

  // Check for game over conditions
  useEffect(() => {
    if (gameState.isPlaying) {
      if (gameState.sanity <= 0) {
        endGame(false);
      } else if (gameState.entropy >= 100 && gameState.score > 50) {
        endGame(true);
      }
    }
  }, [gameState.sanity, gameState.entropy, gameState.score, gameState.isPlaying, endGame]);

  return {
    gameState,
    handleTileClick,
    startGame,
    endGame,
    phaseConfig: PHASE_CONFIGS[gameState.phase],
  };
};
