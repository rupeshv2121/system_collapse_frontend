import { Navbar } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { 
  Activity, 
  BarChart3, 
  Brain, 
  Crown, 
  Flame,
  Gamepad2, 
  Sparkles, 
  Trophy, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, username } = useAuth();
  const { userData } = useUserData();

  const quickStats = [
    {
      icon: Gamepad2,
      label: 'Total Games',
      value: userData.stats.totalGames,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Trophy,
      label: 'Wins',
      value: userData.stats.wins,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Flame,
      label: 'Win Streak',
      value: userData.stats.currentWinStreak,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: Crown,
      label: 'Highest Score',
      value: userData.stats.highestScore,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentAchievements = [
    {
      title: 'First Victory',
      description: 'Won your first game',
      achieved: userData.stats.wins > 0,
      icon: Trophy,
    },
    {
      title: 'Perfect Run',
      description: 'Complete a game with 100% sanity',
      achieved: userData.trends.sanityHistory.some(s => s >= 100),
      icon: Sparkles,
    },
    {
      title: 'High Scorer',
      description: 'Score over 500 points',
      achieved: userData.stats.highestScore >= 500,
      icon: TrendingUp,
    },
    {
      title: 'Experienced',
      description: 'Play 10+ games',
      achieved: userData.stats.totalGames >= 10,
      icon: Brain,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 grid-pattern">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {username ? username.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                Welcome back, {username || user?.email?.split('@')[0] || 'Player'}!
              </h1>
              <p className="text-gray-600">Ready to challenge your mind?</p>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <Card className="mb-8 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gamepad2 className="w-8 h-8 text-blue-600" />
              Start Your Journey
            </CardTitle>
            <CardDescription className="text-base">
              Enter the world of System Collapse where rules change and chaos reigns
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/game')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Game
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/demo')}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 px-8 py-6 text-lg rounded-xl"
              >
                <Activity className="w-5 h-5 mr-2" />
                Try Demo Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <Card className="border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        achievement.achieved 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        achievement.achieved 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {achievement.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.achieved && (
                        <div className="text-green-600 font-bold">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => navigate('/leaderboard')}
                >
                  <Trophy className="w-5 h-5 mr-3 text-yellow-600" />
                  <div>
                    <div className="font-semibold">View Leaderboard</div>
                    <div className="text-xs text-gray-500">See global rankings</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-semibold">Your Analytics</div>
                    <div className="text-xs text-gray-500">Deep dive into your stats</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => navigate('/profile')}
                >
                  <Activity className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-semibold">Profile Settings</div>
                    <div className="text-xs text-gray-500">Manage your account</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Play Style Info */}
        {userData.playerProfile.playStyle && (
          <Card className="mt-6 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Your Play Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-purple-700">
                  {userData.playerProfile.playStyle}
                </div>
                <div className="h-8 w-px bg-purple-300" />
                <div className="text-sm text-gray-700">
                  Archetype: <span className="font-semibold">{userData.playerProfile.psychologicalArchetype}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
