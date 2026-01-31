export interface UserId {
  userId: string;
  createdAt: number;
  lastPlayedAt: number;
}

export interface GameProgressState {
  score: number;
  phase: number;
  entropy: number;
  sanity: number;
  timeRemaining: number;
  isCollapsed: boolean;
}

export interface BehaviorMetrics {
  totalClicks: number;
  averageClickSpeed: number; // milliseconds
  mostClickedColor: TileColor;
  repetitionCount: number;
  varietyScore: number; // 0-100
  hesitationScore: number; // 0-100
  impulsivityScore: number; // 0-100
  patternAdherence: number; // 0-100
}

export interface GameSession {
  sessionId: string;
  finalScore: number;
  finalPhase: number;
  maxEntropyReached: number;
  sanityRemaining: number;
  duration: number; // seconds
  win: boolean;
  dominantBehavior: DominantBehavior;
  timestamp: number;
  clickSequence: TileColor[];
  rulesFollowed: number;
  rulesBroken: number;
  hintsIgnored: number;
}

export type DominantBehavior =
  | "obedient"
  | "chaotic"
  | "pattern-breaker"
  | "adaptive"
  | "resistant"
  | "conformist"
  | "explorer";

export interface WinLossStats {
  totalGames: number;
  wins: number;
  losses: number;
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  collapseCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export interface TrendData {
  entropyHistory: number[]; // Last 20 sessions
  sanityHistory: number[]; // Last 20 sessions
  scoreHistory: number[]; // Last 20 sessions
  phaseReachCounts: Record<number, number>; // phase -> count
  averageSessionDuration: number;
  performanceTrend: "improving" | "declining" | "stable";
}

export interface SystemMemory {
  hintExposureCount: number;
  misleadingHintCount: number;
  ignoredHintCount: number;
  trustLevel: number; // 0-100
  rebellionCount: number; // Times user deliberately broke rules
  complianceCount: number; // Times user followed unclear rules
  systemSuspicionLevel: number; // 0-100
  manipulationResistance: number; // 0-100
}

export interface PlayerProfile {
  playStyle: PlayStyle;
  riskTolerance: number; // 0-100
  adaptabilityScore: number; // 0-100
  patienceScore: number; // 0-100
  chaosAffinity: number; // 0-100
  orderAffinity: number; // 0-100
  learningRate: number; // 0-100
  stressResponse: "freezing" | "impulsive" | "strategic" | "erratic";
  psychologicalArchetype: PsychologicalArchetype;
}

export type PlayStyle =
  | "The Obedient"
  | "The Rebel"
  | "The Analyst"
  | "The Gambler"
  | "The Perfectionist"
  | "The Chaotic"
  | "The Adaptive";

export type PsychologicalArchetype =
  | "rule-follower"
  | "system-challenger"
  | "pattern-seeker"
  | "chaos-embracer"
  | "strategic-thinker"
  | "intuitive-player"
  | "experimental-mind";

export interface AdvancedAnalytics {
  entropyResistance: number; // How well they handle chaos
  sanityManagement: number; // How they maintain sanity
  phaseTransitionSuccess: number; // Success rate across phases
  colorBias: Record<TileColor, number>; // Preference for each color
  timeOfDayPerformance: Record<string, number>; // Performance by hour
  decisionFatigue: number; // Performance degradation over time
  recoveryAbility: number; // Bounce back from mistakes
}

export interface UserDataSchema {
  // Identity
  userId: string;
  createdAt: number;
  lastPlayedAt: number;

  // Current State
  currentState: GameProgressState;

  // Behavior
  behaviorMetrics: BehaviorMetrics;

  // History (last 10 sessions)
  sessions: GameSession[];

  // Statistics
  stats: WinLossStats;

  // Trends
  trends: TrendData;

  // System Interaction
  systemMemory: SystemMemory;

  // Psychological Profile
  playerProfile: PlayerProfile;

  // Advanced Analytics
  analytics: AdvancedAnalytics;

  // Metadata
  version: string; // Schema version for migrations
  lastUpdated: number;
}

// Default/Initial values
export const DEFAULT_USER_DATA: UserDataSchema = {
  userId: "",
  createdAt: 0,
  lastPlayedAt: 0,

  currentState: {
    score: 0,
    phase: 1,
    entropy: 0,
    sanity: 100,
    timeRemaining: 60,
    isCollapsed: false,
  },

  behaviorMetrics: {
    totalClicks: 0,
    averageClickSpeed: 0,
    mostClickedColor: "red",
    repetitionCount: 0,
    varietyScore: 0,
    hesitationScore: 0,
    impulsivityScore: 0,
    patternAdherence: 0,
  },

  sessions: [],

  stats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentWinStreak: 0,
    currentLossStreak: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    collapseCount: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  },

  trends: {
    entropyHistory: [],
    sanityHistory: [],
    scoreHistory: [],
    phaseReachCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    averageSessionDuration: 0,
    performanceTrend: "stable",
  },

  systemMemory: {
    hintExposureCount: 0,
    misleadingHintCount: 0,
    ignoredHintCount: 0,
    trustLevel: 0,
    rebellionCount: 0,
    complianceCount: 0,
    systemSuspicionLevel: 0,
    manipulationResistance: 0,
  },

  playerProfile: {
    playStyle: "The Adaptive",
    riskTolerance: 0,
    adaptabilityScore: 0,
    patienceScore: 0,
    chaosAffinity: 0,
    orderAffinity: 0,
    learningRate: 0,
    stressResponse: "strategic",
    psychologicalArchetype: "intuitive-player",
  },

  analytics: {
    entropyResistance: 0,
    sanityManagement: 0,
    phaseTransitionSuccess: 0,
    colorBias: { red: 25, blue: 25, green: 25, yellow: 25 },
    timeOfDayPerformance: {},
    decisionFatigue: 0,
    recoveryAbility: 0,
  },

  version: "1.0.0",
  lastUpdated: 0,
};

import type { GamePhase, TileColor } from "./game";
export type { GamePhase, TileColor };
