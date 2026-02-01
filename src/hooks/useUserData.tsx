import { useAuth } from '@/contexts/AuthContext';
import { useError } from '@/contexts/ErrorContext';
import { ApiError, userDataApi } from '@/lib/userDataApi';
import { TileColor } from '@/types/game';
import { BehaviorMetrics, DEFAULT_USER_DATA, DominantBehavior, GameSession, PlayStyle, PsychologicalArchetype, UserDataSchema } from '@/types/userData';
import { useCallback, useEffect, useRef, useState } from 'react';

const USER_DATA_KEY = 'system-collapse-user-data';
const MAX_SESSIONS = 10;
const MAX_HISTORY = 20;

const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useUserData = () => {
  const [userData, setUserData] = useState<UserDataSchema>(DEFAULT_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: "network" | "server" | "auth" | "generic" } | null>(null);
  const { user } = useAuth();
  const { showNetworkError, showServerError } = useError();
  const savedSessionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        if (user) {
          const dbData = await userDataApi.loadUserData();
          if (dbData && dbData.userId) {
            setUserData({
              ...DEFAULT_USER_DATA,
              ...dbData,
              userId: user.id,
              lastPlayedAt: Date.now(),
            } as UserDataSchema);
          } else {
            const newUserData: UserDataSchema = {
              ...DEFAULT_USER_DATA,
              userId: user.id,
              createdAt: Date.now(),
              lastPlayedAt: Date.now(),
            };
            setUserData(newUserData);
            await userDataApi.saveUserData(newUserData);
          }
        } else {
          const saved = localStorage.getItem(USER_DATA_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            setUserData(parsed);
          } else {
            const newUserData: UserDataSchema = {
              ...DEFAULT_USER_DATA,
              userId: generateUserId(),
              createdAt: Date.now(),
              lastPlayedAt: Date.now(),
            };
            setUserData(newUserData);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        if (err instanceof ApiError) {
          // Navigate to dedicated error pages for network/server errors
          if (err.type === "network") {
            showNetworkError();
            return;
          } else if (err.type === "server") {
            showServerError();
            return;
          }
          setError({ message: err.message, type: err.type });
        } else {
          setError({ message: "Failed to load user data", type: "generic" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, showNetworkError, showServerError]);

  const saveUserData = useCallback(async (data: UserDataSchema) => {
    try {
      const updated = {
        ...data,
        lastUpdated: Date.now(),
        lastPlayedAt: Date.now(),
      };
      
      if (user) {
        await userDataApi.saveUserData(updated);
      } else {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
      }
      
      setUserData(updated);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }, [user]);

  const analyzePlayStyle = useCallback((behavior: BehaviorMetrics, systemMemory: any): PlayStyle => {
    const { varietyScore, patternAdherence, impulsivityScore } = behavior;
    const { rebellionCount, complianceCount, trustLevel } = systemMemory;

    if (complianceCount > rebellionCount * 2 && trustLevel > 70) {
      return 'The Obedient';
    } else if (rebellionCount > complianceCount * 2) {
      return 'The Rebel';
    } else if (patternAdherence > 70 && varietyScore < 40) {
      return 'The Perfectionist';
    } else if (varietyScore > 70 && impulsivityScore > 60) {
      return 'The Chaotic';
    } else if (impulsivityScore < 40 && patternAdherence < 40) {
      return 'The Analyst';
    } else if (impulsivityScore > 70) {
      return 'The Gambler';
    } else {
      return 'The Adaptive';
    }
  }, []);

  const determinePsychologicalArchetype = useCallback((
    playStyle: PlayStyle,
    behavior: BehaviorMetrics,
    systemMemory: any
  ): PsychologicalArchetype => {
    const { trustLevel, manipulationResistance } = systemMemory;

    if (playStyle === 'The Obedient' || playStyle === 'The Perfectionist') {
      return 'rule-follower';
    } else if (playStyle === 'The Rebel' && manipulationResistance > 70) {
      return 'system-challenger';
    } else if (playStyle === 'The Analyst') {
      return 'pattern-seeker';
    } else if (playStyle === 'The Chaotic') {
      return 'chaos-embracer';
    } else if (behavior.patternAdherence > 60 && trustLevel < 50) {
      return 'strategic-thinker';
    } else if (playStyle === 'The Adaptive') {
      return 'intuitive-player';
    } else {
      return 'experimental-mind';
    }
  }, []);

  const determineDominantBehavior = useCallback((
    clickSequence: TileColor[],
    rulesFollowed: number,
    rulesBroken: number
  ): DominantBehavior => {
    const totalRules = rulesFollowed + rulesBroken;
    const complianceRate = totalRules > 0 ? rulesFollowed / totalRules : 0.5;

    const uniqueColors = new Set(clickSequence).size;
    const varietyRate = clickSequence.length > 0 ? uniqueColors / clickSequence.length : 0;

    if (complianceRate > 0.8) {
      return 'obedient';
    } else if (complianceRate < 0.3) {
      return 'chaotic';
    } else if (varietyRate > 0.7) {
      return 'explorer';
    } else if (varietyRate < 0.3) {
      return 'pattern-breaker';
    } else if (complianceRate > 0.5 && complianceRate < 0.8) {
      return 'adaptive';
    } else if (complianceRate < 0.5 && rulesBroken > rulesFollowed) {
      return 'resistant';
    } else {
      return 'conformist';
    }
  }, []);

  // Record a completed game session
  const recordSession = useCallback(async (sessionData: {
    finalScore: number;
    finalPhase: number;
    maxEntropyReached: number;
    sanityRemaining: number;
    duration: number;
    win: boolean;
    clickSequence: TileColor[];
    rulesFollowed: number;
    rulesBroken: number;
    hintsIgnored: number;
    behaviorMetrics: BehaviorMetrics;
    collapseCount: number;
  }) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const dominantBehavior = determineDominantBehavior(
      sessionData.clickSequence,
      sessionData.rulesFollowed,
      sessionData.rulesBroken
    );

    const newSession: GameSession = {
      sessionId,
      finalScore: sessionData.finalScore,
      finalPhase: sessionData.finalPhase,
      maxEntropyReached: sessionData.maxEntropyReached,
      sanityRemaining: sessionData.sanityRemaining,
      duration: sessionData.duration,
      win: sessionData.win,
      dominantBehavior,
      timestamp: Date.now(),
      clickSequence: sessionData.clickSequence,
      rulesFollowed: sessionData.rulesFollowed,
      rulesBroken: sessionData.rulesBroken,
      hintsIgnored: sessionData.hintsIgnored,
      collapseCount: sessionData.collapseCount,
    };

    setUserData((prev) => {
      const updatedSessions = [newSession, ...prev.sessions].slice(0, MAX_SESSIONS);

      const newStats = {
        ...prev.stats,
        totalGames: prev.stats.totalGames + 1,
        wins: sessionData.win ? prev.stats.wins + 1 : prev.stats.wins,
        losses: sessionData.win ? prev.stats.losses : prev.stats.losses + 1,
        currentWinStreak: sessionData.win ? prev.stats.currentWinStreak + 1 : 0,
        currentLossStreak: sessionData.win ? 0 : prev.stats.currentLossStreak + 1,
        longestWinStreak: sessionData.win 
          ? Math.max(prev.stats.longestWinStreak, prev.stats.currentWinStreak + 1)
          : prev.stats.longestWinStreak,
        longestLossStreak: !sessionData.win
          ? Math.max(prev.stats.longestLossStreak, prev.stats.currentLossStreak + 1)
          : prev.stats.longestLossStreak,
        collapseCount: prev.stats.collapseCount + (sessionData.sanityRemaining <= 0 ? 1 : 0),
        averageScore: ((prev.stats.averageScore * prev.stats.totalGames) + sessionData.finalScore) / (prev.stats.totalGames + 1),
        highestScore: Math.max(prev.stats.highestScore, sessionData.finalScore),
        lowestScore: prev.stats.totalGames === 0 ? sessionData.finalScore : Math.min(prev.stats.lowestScore, sessionData.finalScore),
      };

      const newTrends = {
        entropyHistory: [...prev.trends.entropyHistory, sessionData.maxEntropyReached].slice(-MAX_HISTORY),
        sanityHistory: [...prev.trends.sanityHistory, sessionData.sanityRemaining].slice(-MAX_HISTORY),
        scoreHistory: [...prev.trends.scoreHistory, sessionData.finalScore].slice(-MAX_HISTORY),
        durationHistory: [...(prev.trends.durationHistory || []), sessionData.duration].slice(-MAX_HISTORY),
        phaseReachCounts: {
          ...prev.trends.phaseReachCounts,
          [sessionData.finalPhase]: (prev.trends.phaseReachCounts[sessionData.finalPhase] || 0) + 1,
        },
        averageSessionDuration: ((prev.trends.averageSessionDuration * prev.stats.totalGames) + sessionData.duration) / (prev.stats.totalGames + 1),
        performanceTrend: (prev.trends.scoreHistory.length >= 3
          ? (sessionData.finalScore > prev.trends.scoreHistory.slice(-3).reduce((a, b) => a + b, 0) / 3 ? 'improving' : 
             sessionData.finalScore < prev.trends.scoreHistory.slice(-3).reduce((a, b) => a + b, 0) / 3 ? 'declining' : 'stable')
          : 'stable') as 'improving' | 'declining' | 'stable',
      };

      const newSystemMemory = {
        ...prev.systemMemory,
        ignoredHintCount: prev.systemMemory.ignoredHintCount + sessionData.hintsIgnored,
        rebellionCount: prev.systemMemory.rebellionCount + sessionData.rulesBroken,
        complianceCount: prev.systemMemory.complianceCount + sessionData.rulesFollowed,
        trustLevel: Math.max(0, Math.min(100, prev.systemMemory.trustLevel + 
          (sessionData.rulesFollowed > sessionData.rulesBroken ? 2 : -3))),
        manipulationResistance: Math.max(0, Math.min(100, prev.systemMemory.manipulationResistance + 
          (sessionData.hintsIgnored > 2 ? 1 : 0))),
      };

      const playStyle = analyzePlayStyle(sessionData.behaviorMetrics, newSystemMemory);
      const psychologicalArchetype = determinePsychologicalArchetype(playStyle, sessionData.behaviorMetrics, newSystemMemory);

      const newPlayerProfile = {
        ...prev.playerProfile,
        playStyle,
        psychologicalArchetype,
        riskTolerance: Math.round((sessionData.behaviorMetrics.impulsivityScore + (sessionData.maxEntropyReached / 100 * 100)) / 2),
        adaptabilityScore: Math.round(sessionData.behaviorMetrics.varietyScore),
        chaosAffinity: Math.round((sessionData.maxEntropyReached / 100) * 100),
        orderAffinity: Math.round((sessionData.behaviorMetrics.patternAdherence)),
      };

      const updated: UserDataSchema = {
        ...prev,
        sessions: updatedSessions,
        stats: newStats,
        trends: newTrends,
        systemMemory: newSystemMemory,
        playerProfile: newPlayerProfile,
        behaviorMetrics: sessionData.behaviorMetrics,
      };

      saveUserData(updated);

      if (user && !savedSessionsRef.current.has(sessionId)) {
        savedSessionsRef.current.add(sessionId);
        userDataApi.saveGameSession({
          ...newSession,
          behaviorMetrics: sessionData.behaviorMetrics,
          systemMemory: newSystemMemory,
        }).catch(err => console.error('Failed to save session:', err));
      }

      return updated;
    });
  }, [analyzePlayStyle, determinePsychologicalArchetype, determineDominantBehavior, saveUserData, user]);

  const updateCurrentState = useCallback((state: Partial<UserDataSchema['currentState']>) => {
    setUserData((prev) => {
      const updated = {
        ...prev,
        currentState: {
          ...prev.currentState,
          ...state,
        },
      };
      saveUserData(updated);
      return updated;
    });
  }, [saveUserData]);

  const resetUserData = useCallback(() => {
    const newUserData: UserDataSchema = {
      ...DEFAULT_USER_DATA,
      userId: generateUserId(),
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    };
    saveUserData(newUserData);
  }, [saveUserData]);

  return {
    userData,
    isLoading,
    error,
    recordSession,
    updateCurrentState,
    resetUserData,
    saveUserData,
  };
};
