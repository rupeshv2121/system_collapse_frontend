import { Navbar } from "@/components/NavLink";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, userDataApi } from "@/lib/userDataApi";
import { Award, Crown, Medal, TrendingUp, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  username: string;
  score: number;
  entropy: number;
  phase: number;
  won: boolean;
  playedAt: string;
}

interface TopWinner {
  username: string;
  wins: number;
}

const Leaderboard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topWinners, setTopWinners] = useState<TopWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: "network" | "server" | "auth" | "generic" } | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "wins">("score");

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [global, winners] = await Promise.all([
        userDataApi.getGlobalLeaderboard(),
        userDataApi.getTopWinners(),
      ]);
      setGlobalLeaderboard(global);
      setTopWinners(winners);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      if (err instanceof ApiError) {
        setError({ message: err.message, type: err.type });
      } else {
        setError({ message: "Failed to load leaderboard data", type: "generic" });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-600 font-bold text-lg">#{rank}</span>;
  };

  const getRankBgClass = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300";
    if (rank === 2) return "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300";
    if (rank === 3) return "bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-300";
    return "bg-blue-50 border-blue-200";
  };

  const LeaderboardEntrySkeleton = () => (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-gray-800/40 border-gray-700/50">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );

  const StatCardSkeleton = () => (
    <div className="bg-gray-800/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            Compete with players worldwide and climb to the top!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("score")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "score"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Top Scores
          </button>
          <button
            onClick={() => setActiveTab("wins")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "wins"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <Award className="w-5 h-5" />
            Top Winners
          </button>
        </div>

        {/* Content */}
        {error ? (
          <ErrorDisplay
            message={error.message}
            type={error.type}
            onRetry={loadLeaderboardData}
          />
        ) : loading ? (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-3 mb-8">
              {[...Array(5)].map((_, index) => (
                <LeaderboardEntrySkeleton key={index} />
              ))}
            </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {activeTab === "score" ? (
              <div className="space-y-3">
                {globalLeaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border backdrop-blur-sm transition-all hover:scale-[1.02] ${getRankBgClass(
                      index + 1,
                    )}`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* Username */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-bold text-lg truncate">
                          {entry.username}
                        </p>
                        {entry.won && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full border border-green-300">
                            Winner
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        Phase {entry.phase} • Entropy: {entry.entropy.toFixed(2)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <p className="text-2xl font-bold text-gray-900">
                          {entry.score.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {new Date(entry.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {globalLeaderboard.length === 0 && (
                  <div className="text-center py-20">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No scores yet. Be the first to play!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {topWinners.map((winner, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border backdrop-blur-sm transition-all hover:scale-[1.02] ${getRankBgClass(
                      index + 1,
                    )}`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* Username */}
                    <div className="flex-1">
                      <p className="text-gray-900 font-bold text-lg">
                        {winner.username}
                      </p>
                      <p className="text-gray-600 text-sm">Elite Champion</p>
                    </div>

                    {/* Wins */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <p className="text-2xl font-bold text-gray-900">
                          {winner.wins}
                        </p>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {winner.wins === 1 ? "Victory" : "Victories"}
                      </p>
                    </div>
                  </div>
                ))}

                {topWinners.length === 0 && (
                  <div className="text-center py-20">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No winners yet. Will you be the first?
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-gray-800/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-white font-bold text-lg">Total Players</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {globalLeaderboard.length}
                </p>
              </div>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-amber-500" />
              <h3 className="text-gray-900 font-bold text-lg">Total Players</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {globalLeaderboard.length}
            </p>
          </div>

          <div className="bg-green-50 border border-green-300 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-green-600" />
              <h3 className="text-gray-900 font-bold text-lg">Total Wins</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {globalLeaderboard.filter((e) => e.won).length}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-amber-600" />
              <h3 className="text-gray-900 font-bold text-lg">Highest Score</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {globalLeaderboard[0]?.score.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
