/**
 * Game statistics management with localStorage persistence
 * Game data is now saved to backend via userDataApi
 */

import { GamePhase, GameStats, INITIAL_STATS } from '@/types/game';
import { useCallback, useEffect, useState } from 'react';

const STATS_KEY = 'rule-collapse-stats';

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<GameStats>;
        setStats({
          ...INITIAL_STATS,
          ...parsed,
          sanityLossHistory: parsed.sanityLossHistory ?? INITIAL_STATS.sanityLossHistory,
          entropyHistory: parsed.entropyHistory ?? INITIAL_STATS.entropyHistory,
          durationHistory: parsed.durationHistory ?? INITIAL_STATS.durationHistory,
          gameResults: parsed.gameResults ?? INITIAL_STATS.gameResults,
        });
      }
    } catch (error) {
      console.error('Failed to load game stats:', error);
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: GameStats) => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to save game stats:', error);
    }
  }, []);

  // Record game end
  const recordGameEnd = useCallback(
    (result: {
      won: boolean;
      finalScore: number;
      finalEntropy: number;
      finalSanity: number;
      phaseReached: GamePhase;
      duration?: number;
    }) => {
      setStats((prev: GameStats) => {
        const newStats: GameStats = {
          ...prev,
          totalGamesPlayed: prev.totalGamesPlayed + 1,
          gamesWon: result.won ? prev.gamesWon + 1 : prev.gamesWon,
          gamesLost: result.won ? prev.gamesLost : prev.gamesLost + 1,
          currentWinStreak: result.won ? prev.currentWinStreak + 1 : 0,
          currentLossStreak: result.won ? 0 : prev.currentLossStreak + 1,
          maxWinStreak: result.won
            ? Math.max(prev.maxWinStreak, prev.currentWinStreak + 1)
            : prev.maxWinStreak,
          maxLossStreak: result.won
            ? prev.maxLossStreak
            : Math.max(prev.maxLossStreak, prev.currentLossStreak + 1),
          totalEntropySum: prev.totalEntropySum + result.finalEntropy,
          averageEntropyReached:
            (prev.totalEntropySum + result.finalEntropy) / (prev.totalGamesPlayed + 1),
          sanityLossHistory: [...(prev.sanityLossHistory ?? []).slice(-19), 100 - result.finalSanity],
          entropyHistory: [...(prev.entropyHistory ?? []).slice(-19), result.finalEntropy],
          durationHistory: [...(prev.durationHistory ?? []).slice(-19), result.duration || 0],
          gameResults: [
            ...(prev.gameResults ?? []).slice(-49),
            {
              won: result.won,
              finalScore: result.finalScore,
              finalEntropy: result.finalEntropy,
              finalSanity: result.finalSanity,
              phaseReached: result.phaseReached,
              timestamp: Date.now(),
            },
          ],
        };

        saveStats(newStats);
        return newStats;
      });
    },
    [saveStats]
  );

  // Reset all stats
  const resetStats = useCallback(() => {
    setStats(INITIAL_STATS);
    saveStats(INITIAL_STATS);
  }, [saveStats]);

  return {
    stats,
    recordGameEnd,
    resetStats,
  };
};
