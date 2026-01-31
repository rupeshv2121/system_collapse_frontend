/**
 * API functions for user data synchronization via Backend API
 */

import type { GameSession, UserDataSchema } from "@/types/userData";
import { supabase } from "./supabase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Helper for authenticated API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

export const userDataApi = {
  // Save complete user data to database via backend
  async saveUserData(userData: UserDataSchema) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile via backend
      await apiCall(`/api/profile`, {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          play_style: userData.playerProfile.playStyle,
          risk_tolerance: userData.playerProfile.riskTolerance,
          adaptability_score: userData.playerProfile.adaptabilityScore,
          patience_score: userData.playerProfile.patienceScore,
          chaos_affinity: userData.playerProfile.chaosAffinity,
          order_affinity: userData.playerProfile.orderAffinity,
          learning_rate: userData.playerProfile.learningRate,
          stress_response: userData.playerProfile.stressResponse,
          psychological_archetype:
            userData.playerProfile.psychologicalArchetype,
        }),
      });

      return { success: true };
    } catch (error) {
      console.error("Error saving user data:", error);
      return { success: false, error };
    }
  },

  // Save a game session via backend
  async saveGameSession(
    session: GameSession & {
      behaviorMetrics: any;
      systemMemory: any;
    },
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await apiCall(`/api/stats`, {
        method: "POST",
        body: JSON.stringify({
          session_id: session.sessionId,
          final_score: session.finalScore,
          final_entropy: session.maxEntropyReached,
          final_sanity: session.sanityRemaining,
          phase_reached: session.finalPhase,
          won: session.win,
          duration: session.duration,
          total_clicks: session.behaviorMetrics.totalClicks,
          average_click_speed: session.behaviorMetrics.averageClickSpeed,
          most_clicked_color: session.behaviorMetrics.mostClickedColor,
          repetition_count: session.behaviorMetrics.repetitionCount,
          variety_score: session.behaviorMetrics.varietyScore,
          hesitation_score: session.behaviorMetrics.hesitationScore,
          impulsivity_score: session.behaviorMetrics.impulsivityScore,
          pattern_adherence: session.behaviorMetrics.patternAdherence,
          dominant_behavior: session.dominantBehavior,
          click_sequence: session.clickSequence,
          rules_followed: session.rulesFollowed,
          rules_broken: session.rulesBroken,
          hints_ignored: session.hintsIgnored,
          hint_exposure_count: session.systemMemory.hintExposureCount,
          misleading_hint_count: session.systemMemory.misleadingHintCount,
          trust_level: session.systemMemory.trustLevel,
          rebellion_count: session.systemMemory.rebellionCount,
          compliance_count: session.systemMemory.complianceCount,
          manipulation_resistance: session.systemMemory.manipulationResistance,
        }),
      });

      return { success: true };
    } catch (error) {
      console.error("Error saving game session:", error);
      return { success: false, error };
    }
  },

  // Load user data from backend
  async loadUserData(): Promise<Partial<UserDataSchema> | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Load profile from backend
      const profile = await apiCall<any>(`/api/profile/${user.id}`, {
        method: "GET",
      });

      // Load stats from backend
      const stats = await apiCall<any>(`/api/stats/${user.id}`, {
        method: "GET",
      });

      // Transform backend data to UserDataSchema format
      const userData: Partial<UserDataSchema> = {
        userId: user.id,
        lastPlayedAt: Date.now(),
      };

      if (profile) {
        userData.playerProfile = {
          playStyle: profile.play_style,
          riskTolerance: profile.risk_tolerance,
          adaptabilityScore: profile.adaptability_score,
          patienceScore: profile.patience_score,
          chaosAffinity: profile.chaos_affinity,
          orderAffinity: profile.order_affinity,
          learningRate: profile.learning_rate,
          stressResponse: profile.stress_response,
          psychologicalArchetype: profile.psychological_archetype,
        };
      }

      if (stats && stats.length > 0) {
        // Calculate aggregated stats from sessions
        const totalGames = stats.length;
        const wins = stats.filter((s: any) => s.won).length;
        const losses = totalGames - wins;

        userData.stats = {
          totalGames,
          wins,
          losses,
          currentWinStreak: 0,
          currentLossStreak: 0,
          longestWinStreak: 0,
          longestLossStreak: 0,
          collapseCount: stats.filter((s: any) => s.final_sanity <= 0).length,
          averageScore:
            stats.reduce((sum: number, s: any) => sum + s.final_score, 0) /
            totalGames,
          highestScore: Math.max(...stats.map((s: any) => s.final_score)),
          lowestScore: Math.min(...stats.map((s: any) => s.final_score)),
        };

        userData.trends = {
          entropyHistory: stats.map((s: any) => s.final_entropy).slice(0, 20),
          sanityHistory: stats.map((s: any) => s.final_sanity).slice(0, 20),
          scoreHistory: stats.map((s: any) => s.final_score).slice(0, 20),
          phaseReachCounts: stats.reduce(
            (acc: any, s: any) => {
              acc[s.phase_reached] = (acc[s.phase_reached] || 0) + 1;
              return acc;
            },
            { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          ),
          averageSessionDuration:
            stats.reduce((sum: number, s: any) => sum + s.duration, 0) /
            totalGames,
          performanceTrend: "stable" as any,
        };

        userData.sessions = stats.slice(0, 10).map((s: any) => ({
          sessionId: s.session_id,
          finalScore: s.final_score,
          finalPhase: s.phase_reached,
          maxEntropyReached: s.final_entropy,
          sanityRemaining: s.final_sanity,
          duration: s.duration,
          win: s.won,
          dominantBehavior: s.dominant_behavior,
          timestamp: new Date(s.played_at).getTime(),
          clickSequence: s.click_sequence || [],
          rulesFollowed: s.rules_followed,
          rulesBroken: s.rules_broken,
          hintsIgnored: s.hints_ignored,
        }));

        // Get behavior metrics from most recent session
        if (stats.length > 0) {
          const recent = stats[0];
          userData.behaviorMetrics = {
            totalClicks: recent.total_clicks || 0,
            averageClickSpeed: recent.average_click_speed || 0,
            mostClickedColor: recent.most_clicked_color || "red",
            repetitionCount: recent.repetition_count || 0,
            varietyScore: recent.variety_score || 50,
            hesitationScore: recent.hesitation_score || 50,
            impulsivityScore: recent.impulsivity_score || 50,
            patternAdherence: recent.pattern_adherence || 50,
          };

          userData.systemMemory = {
            hintExposureCount: recent.hint_exposure_count || 0,
            misleadingHintCount: recent.misleading_hint_count || 0,
            ignoredHintCount: recent.hints_ignored || 0,
            trustLevel: recent.trust_level || 50,
            rebellionCount: recent.rebellion_count || 0,
            complianceCount: recent.compliance_count || 0,
            systemSuspicionLevel: 0,
            manipulationResistance: recent.manipulation_resistance || 50,
          };
        }

        userData.analytics = {
          entropyResistance: 50,
          sanityManagement: 50,
          phaseTransitionSuccess: 50,
          colorBias: { red: 25, blue: 25, green: 25, yellow: 25 },
          timeOfDayPerformance: {},
          decisionFatigue: 50,
          recoveryAbility: 50,
        };
      }

      return userData;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  },

  // Get global leaderboard
  async getGlobalLeaderboard() {
    try {
      return await apiCall<any[]>("/api/leaderboard/global");
    } catch (error) {
      console.error("Error fetching global leaderboard:", error);
      return [];
    }
  },

  // Get top winners
  async getTopWinners() {
    try {
      return await apiCall<any[]>("/api/leaderboard/top-winners");
    } catch (error) {
      console.error("Error fetching top winners:", error);
      return [];
    }
  },
};
