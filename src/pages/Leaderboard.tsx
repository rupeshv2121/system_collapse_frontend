import { Navbar } from "@/components/NavLink";
import { userDataApi } from "@/lib/userDataApi";
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
  const [activeTab, setActiveTab] = useState<"score" | "wins">("score");

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      const [global, winners] = await Promise.all([
        userDataApi.getGlobalLeaderboard(),
        userDataApi.getTopWinners(),
      ]);
      setGlobalLeaderboard(global);
      setTopWinners(winners);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-400 font-bold text-lg">#{rank}</span>;
  };

  const getRankBgClass = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
    return "bg-gray-800/40 border-gray-700/50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Compete with players worldwide and climb to the top!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("score")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "score"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Top Scores
          </button>
          <button
            onClick={() => setActiveTab("wins")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "wins"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Award className="w-5 h-5" />
            Top Winners
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
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
                        <p className="text-white font-bold text-lg truncate">
                          {entry.username}
                        </p>
                        {entry.won && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                            Winner
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        Phase {entry.phase} • Entropy: {entry.entropy.toFixed(2)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <p className="text-2xl font-bold text-white">
                          {entry.score.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {new Date(entry.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {globalLeaderboard.length === 0 && (
                  <div className="text-center py-20">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
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
                      <p className="text-white font-bold text-lg">
                        {winner.username}
                      </p>
                      <p className="text-gray-400 text-sm">Elite Champion</p>
                    </div>

                    {/* Wins */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <p className="text-2xl font-bold text-white">
                          {winner.wins}
                        </p>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {winner.wins === 1 ? "Victory" : "Victories"}
                      </p>
                    </div>
                  </div>
                ))}

                {topWinners.length === 0 && (
                  <div className="text-center py-20">
                    <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
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
          <div className="bg-gray-800/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h3 className="text-white font-bold text-lg">Total Players</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {globalLeaderboard.length}
            </p>
          </div>

          <div className="bg-gray-800/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-green-400" />
              <h3 className="text-white font-bold text-lg">Total Wins</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {globalLeaderboard.filter((e) => e.won).length}
            </p>
          </div>

          <div className="bg-gray-800/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-pink-400" />
              <h3 className="text-white font-bold text-lg">Highest Score</h3>
            </div>
            <p className="text-3xl font-bold text-pink-400">
              {globalLeaderboard[0]?.score.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
