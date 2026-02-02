import { supabase } from '@/lib/supabase';
import { GamePhase, GameStats, INITIAL_STATS } from '@/types/game';
import { useCallback, useEffect, useState } from 'react';

const STATS_KEY = 'rule-collapse-stats';

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatsFromDatabase = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          // No user logged in, load from localStorage
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
          setLoading(false);
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        
        // Fetch game history from backend
        const response = await fetch(`${BACKEND_URL}/api/stats/history`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const gameHistory = await response.json();
          
          const calculatedStats = calculateStatsFromHistory(gameHistory);
          setStats(calculatedStats);
          
          // Save to localStorage for offline access
          localStorage.setItem(STATS_KEY, JSON.stringify(calculatedStats));
        } else {
          // Fallback to localStorage if API fails
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
        }
      } catch (error) {
        console.error('Error loading stats from database:', error);
        // Fallback to localStorage
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
      } finally {
        setLoading(false);
      }
    };

    loadStatsFromDatabase();
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: GameStats) => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (error) {
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
    loading,
  };
};

// Helper function to calculate stats from game history
function calculateStatsFromHistory(gameHistory: any[]): GameStats {
  if (!gameHistory || gameHistory.length === 0) {
    return INITIAL_STATS;
  }

  let gamesWon = 0;
  let gamesLost = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let totalEntropySum = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  const entropyHistory: number[] = [];
  const sanityLossHistory: number[] = [];
  const durationHistory: number[] = [];
  const gameResults: any[] = [];

  // Sort by played_at to ensure correct order
  const sortedGames = [...gameHistory].sort((a, b) => 
    new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  sortedGames.forEach((game) => {
    const won = game.won;
    
    if (won) {
      gamesWon++;
      tempWinStreak++;
      tempLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
    } else {
      gamesLost++;
      tempLossStreak++;
      tempWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, tempLossStreak);
    }

    totalEntropySum += game.final_entropy;
    entropyHistory.push(game.final_entropy);
    sanityLossHistory.push(100 - game.final_sanity);
    durationHistory.push(game.total_time);
    
    gameResults.push({
      won: game.won,
      finalScore: game.final_score,
      finalEntropy: game.final_entropy,
      finalSanity: game.final_sanity,
      phaseReached: game.phase_reached,
      timestamp: new Date(game.played_at).getTime(),
    });
  });

  // Current streaks are the last calculated streaks
  currentWinStreak = tempWinStreak;
  currentLossStreak = tempLossStreak;

  const totalGamesPlayed = gamesWon + gamesLost;
  const averageEntropyReached = totalGamesPlayed > 0 ? totalEntropySum / totalGamesPlayed : 0;

  return {
    totalGamesPlayed,
    gamesWon,
    gamesLost,
    currentWinStreak,
    currentLossStreak,
    maxWinStreak,
    maxLossStreak,
    totalEntropySum,
    averageEntropyReached,
    sanityLossHistory: sanityLossHistory.slice(-20),
    entropyHistory: entropyHistory.slice(-20),
    durationHistory: durationHistory.slice(-20),
    gameResults: gameResults.slice(-50),
  };
}
