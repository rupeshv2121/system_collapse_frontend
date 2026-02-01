import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GuidedTour, TourStep } from '@/components/ui/guided-tour';
import { useGameStats } from '@/hooks/useGameStats';
import { useUserData } from '@/hooks/useUserData';
import { Brain, Flame, HelpCircle, RotateCcw, Skull, Trophy, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { UserAnalyticsDashboard } from './UserAnalyticsDashboard';

// Custom label renderer for pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={name === 'Wins' ? '#22c55e' : '#ef4444'} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold' }}
    >
      {`${name}: ${value}`}
    </text>
  );
};

const AnalyticsDashboard = () => {
  const { stats, resetStats } = useGameStats();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<'game-stats' | 'user-profile'>('game-stats');
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Define tour steps - MODIFY THESE to change the guided tour
  const tourSteps: TourStep[] = [
    {
      target: '[data-tour="header"]',
      title: 'Welcome to Analytics! 📊',
      content: 'This dashboard shows all your game statistics and performance metrics. Let me show you around!',
      position: 'bottom',
    },
    {
      target: '[data-tour="tabs"]',
      title: 'Two Types of Analytics',
      content: 'Switch between Game Statistics (performance data) and User Profile (psychological analysis based on your gameplay patterns).',
      position: 'bottom',
    },
    {
      target: '[data-tour="stats-overview"]',
      title: 'Quick Stats Overview',
      content: 'At a glance: Total games played, your win rate percentage, average entropy reached, and your best win streak.',
      position: 'bottom',
    },
    {
      target: '[data-tour="win-loss-chart"]',
      title: 'Win/Loss Distribution',
      content: 'Visual breakdown of your wins versus losses. The more you play, the more data you\'ll see here!',
      position: 'right',
    },
    {
      target: '[data-tour="entropy-chart"]',
      title: 'Entropy Progress',
      content: 'Track how far you reached into chaos in each game. Higher entropy means you survived longer into the game\'s harder phases.',
      position: 'left',
    },
    {
      target: '[data-tour="duration-chart"]',
      title: 'Time Played Per Game',
      content: 'See how long each game lasted. Longer games often mean better performance and higher scores.',
      position: 'right',
    },
    {
      target: '[data-tour="scores-chart"]',
      title: 'Recent Game Scores',
      content: 'Your last 10 game scores are displayed here. Green bars indicate wins, gray bars show losses.',
      position: 'left',
    },
    {
      target: '[data-tour="reset-button"]',
      title: 'Reset Stats',
      content: 'Click here to clear all statistics and start fresh. Use this if you want to track a new session.',
      position: 'bottom',
    },
  ];

  const handleRestartTour = () => {
    setIsTourOpen(true);
  };

  // Prepare chart data
  const winLossData = useMemo(() => [
    { name: 'Wins', value: stats.gamesWon, fill: 'hsl(var(--success))' },
    { name: 'Losses', value: stats.gamesLost, fill: 'hsl(var(--destructive))' },
  ], [stats.gamesWon, stats.gamesLost]);

  const entropyData = useMemo(() => 
    stats.entropyHistory.map((value, index) => ({
      game: index + 1,
      entropy: value,
    }))
  , [stats.entropyHistory]);

  const durationData = useMemo(() => 
    (stats.durationHistory || []).map((value, index) => ({
      game: index + 1,
      duration: value,
    }))
  , [stats.durationHistory]);

  const sanityLossData = useMemo(() => 
    stats.sanityLossHistory.map((value, index) => ({
      game: index + 1,
      loss: value,
      sanity: 100 - value,
    }))
  , [stats.sanityLossHistory]);

  const recentGames = useMemo(() => 
    stats.gameResults.slice(-10).map((game, index) => ({
      game: index + 1,
      score: game.finalScore,
      phase: game.phaseReached,
      won: game.won,
    }))
  , [stats.gameResults]);

  const winRate = stats.totalGamesPlayed > 0 
    ? ((stats.gamesWon / stats.totalGamesPlayed) * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 bg-primary animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 bg-secondary animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with Title and Reset */}
        <header className="flex items-center justify-between mb-8" data-tour="header">
          <h1 className="text-2xl md:text-3xl font-bold font-game tracking-wider neon-text">
            ANALYTICS
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRestartTour}
              className="gap-2"
              title="Restart guided tour"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetStats}
              className="gap-2 text-destructive hover:text-destructive"
              data-tour="reset-button"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Stats</span>
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6  mx-auto justify-center sm:flex-row flex-col" data-tour="tabs">
          <Button
            variant={activeTab === 'game-stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('game-stats')}
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Game Statistics
          </Button>
          <Button
            variant={activeTab === 'user-profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('user-profile')}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            User Profile
          </Button>
        </div>

        {/* Conditional Content */}
        {activeTab === 'game-stats' ? (
          <>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-tour="stats-overview">
          <Card className="hud-panel border-blue-300 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-blue-700 hud-value">{stats.totalGamesPlayed}</div>
              <div className="text-xs text-gray-700 uppercase tracking-wider">Total Games</div>
            </CardContent>
          </Card>

          <Card className="hud-panel border-green-300 bg-green-50">
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold text-green-700">{winRate}%</div>
              <div className="text-xs text-gray-700 uppercase tracking-wider">Win Rate</div>
            </CardContent>
          </Card>

          <Card className="hud-panel border-orange-300 bg-orange-50">
            <CardContent className="pt-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-3xl font-bold text-orange-700">{stats.averageEntropyReached.toFixed(1)}</div>
              <div className="text-xs text-gray-700 uppercase tracking-wider">Avg Entropy</div>
            </CardContent>
          </Card>

          <Card className="hud-panel border-red-300 bg-red-50">
            <CardContent className="pt-6 text-center">
              <Skull className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-3xl font-bold text-red-700">{stats.maxWinStreak}</div>
              <div className="text-xs text-gray-700 uppercase tracking-wider">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Win/Loss Distribution */}
          <Card className="hud-panel" data-tour="win-loss-chart">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Win/Loss Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalGamesPlayed > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="text-xs">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelStyle={{ fontSize: '12px' }}
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: '#000000'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No games played yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entropy Over Time */}
          <Card className="hud-panel" data-tour="entropy-chart">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Entropy Reached per Game</CardTitle>
            </CardHeader>
            <CardContent>
              {entropyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={entropyData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="game" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      height={30}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      domain={[0, 100]}
                      width={40}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="entropy" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Play games to see entropy trends
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Time Played per Game */}
          <Card className="hud-panel" data-tour="duration-chart">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Total Time Played per Game</CardTitle>
            </CardHeader>
            <CardContent>
              {durationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={durationData} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="game" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      height={30}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      width={45}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const minutes = Math.floor(data.duration / 60);
                          const seconds = data.duration % 60;
                          return (
                            <div style={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem',
                              padding: '8px 12px',
                              color: 'hsl(var(--foreground))'
                            }}>
                              <div><strong>Game {data.game}</strong></div>
                              <div style={{ color: 'hsl(var(--success))' }}>
                                Time: {minutes}:{seconds.toString().padStart(2, '0')}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--success))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Play games to see time trends
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Games Performance */}
          <Card className="hud-panel" data-tour="scores-chart">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Recent Game Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={recentGames} margin={{ top: 20, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="game" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      height={30}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      width={40}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem',
                              padding: '8px 12px',
                              color: 'hsl(var(--foreground))'
                            }}>
                              <div><strong>Game {data.game}</strong></div>
                              <div style={{ color: data.won ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                                {data.won ? '✓ Won' : '✗ Lost'}
                              </div>
                              <div>Score: {data.score}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList 
                        dataKey="score" 
                        position="top" 
                        style={{ 
                          fill: 'hsl(var(--foreground))', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      {recentGames.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.won ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Play games to see score history
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streaks Section */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hud-panel">
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold text-success">{stats.currentWinStreak}</div>
              <div className="text-xs text-muted-foreground">Current Win Streak</div>
            </CardContent>
          </Card>
          <Card className="hud-panel">
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold text-destructive">{stats.currentLossStreak}</div>
              <div className="text-xs text-muted-foreground">Current Loss Streak</div>
            </CardContent>
          </Card>
          <Card className="hud-panel">
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold text-primary">{stats.maxWinStreak}</div>
              <div className="text-xs text-muted-foreground">Best Win Streak</div>
            </CardContent>
          </Card>
          <Card className="hud-panel">
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold text-red-600">{stats.maxLossStreak}</div>
              <div className="text-xs text-gray-700">Worst Loss Streak</div>
            </CardContent>
          </Card>
        </div>
          </>
        ) : (
          <UserAnalyticsDashboard />
        )}

        {/* Guided Tour */}
        <GuidedTour
          steps={tourSteps}
          storageKey="analytics-tour-completed"
          isOpen={isTourOpen}
          onComplete={() => {
            console.log('Tour completed!');
            setIsTourOpen(false);
          }}
          onSkip={() => {
            console.log('Tour skipped');
            setIsTourOpen(false);
          }}
          onClose={() => setIsTourOpen(false)}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
