/**
 * Core game type definitions for Rule Collapse
 */

export type TileColor = "red" | "blue" | "green" | "yellow";

export type GamePhase = 1 | 2 | 3 | 4 | 5;

export interface TileState {
  id: number;
  color: TileColor;
  position: { row: number; col: number };
  isShaking: boolean;
  rotation: number;
  drift: { x: number; y: number };
}

export interface ClickRecord {
  timestamp: number;
  color: TileColor;
  tileId: number;
  wasCorrect: boolean;
  responseTime: number;
}

export interface GameState {
  score: number;
  phase: GamePhase;
  entropy: number;
  sanity: number;
  timeRemaining: number;
  clickHistory: ClickRecord[];
  currentInstruction: TileColor;
  secretCorrectColor: TileColor; // The actual color that gives points (may differ from instruction)
  tiles: TileState[];
  isPlaying: boolean;
  roundStartTime: number;
  lastClickTime: number;
  consecutiveSameColor: number;
  uniqueColorsClicked: Set<TileColor>;
  gameStartTime: number;
}

export interface GameStats {
  totalGamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  currentWinStreak: number;
  currentLossStreak: number;
  maxWinStreak: number;
  maxLossStreak: number;
  averageEntropyReached: number;
  totalEntropySum: number;
  sanityLossHistory: number[];
  entropyHistory: number[];
  gameResults: Array<{
    won: boolean;
    finalScore: number;
    finalEntropy: number;
    finalSanity: number;
    phaseReached: GamePhase;
    timestamp: number;
  }>;
}

export interface PhaseConfig {
  name: string;
  entropyThreshold: number;
  timerDuration: number;
  sanityDrainRate: number;
  scoreMultiplier: number;
  visualEffects: {
    jitter: number;
    blur: number;
    hueShift: number;
    opacity: number;
  };
}

export const PHASE_CONFIGS: Record<GamePhase, PhaseConfig> = {
  1: {
    name: "STABLE",
    entropyThreshold: 0,
    timerDuration: 10,
    sanityDrainRate: 1,
    scoreMultiplier: 1,
    visualEffects: { jitter: 0, blur: 0, hueShift: 0, opacity: 1 },
  },
  2: {
    name: "MEANING DRIFT",
    entropyThreshold: 25,
    timerDuration: 9,
    sanityDrainRate: 2,
    scoreMultiplier: 1.5,
    visualEffects: { jitter: 1, blur: 0.5, hueShift: 10, opacity: 0.95 },
  },
  3: {
    name: "INVERSION",
    entropyThreshold: 50,
    timerDuration: 7,
    sanityDrainRate: 3,
    scoreMultiplier: 2,
    visualEffects: { jitter: 3, blur: 1, hueShift: 30, opacity: 0.9 },
  },
  4: {
    name: "BEHAVIOR",
    entropyThreshold: 75,
    timerDuration: 6,
    sanityDrainRate: 4,
    scoreMultiplier: 2.5,
    visualEffects: { jitter: 5, blur: 1.5, hueShift: 60, opacity: 0.85 },
  },
  5: {
    name: "COLLAPSE",
    entropyThreshold: 90,
    timerDuration: 5,
    sanityDrainRate: 5,
    scoreMultiplier: 3,
    visualEffects: { jitter: 10, blur: 2, hueShift: 120, opacity: 0.8 },
  },
};

export const COLORS: TileColor[] = ["red", "blue", "green", "yellow"];

export const INITIAL_STATS: GameStats = {
  totalGamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  currentWinStreak: 0,
  currentLossStreak: 0,
  maxWinStreak: 0,
  maxLossStreak: 0,
  averageEntropyReached: 0,
  totalEntropySum: 0,
  sanityLossHistory: [],
  entropyHistory: [],
  gameResults: [],
};
