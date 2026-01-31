import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStats } from '@/hooks/useGameStats';
import { Brain, Flame, RotateCcw, Skull, Trophy, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  const [activeTab, setActiveTab] = useState<'game-stats' | 'user-profile'>('game-stats');

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

  const sanityLossData = useMemo(() => 
    stats.sanityLossHistory.map((value, index) => ({
      game: index + 1,
      loss: value,
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
    ? ((stats.gamesWon / stats.totalGamesPlayed) * 100).toFixed(1)
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
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-game tracking-wider neon-text">
            ANALYTICS
          </h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetStats}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Stats
          </Button>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hud-panel border-primary/30">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold hud-value">{stats.totalGamesPlayed}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Games</div>
            </CardContent>
          </Card>

          <Card className="hud-panel border-success/30">
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-success" />
              <div className="text-3xl font-bold text-success">{winRate}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</div>
            </CardContent>
          </Card>

          <Card className="hud-panel border-accent/30">
            <CardContent className="pt-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-3xl font-bold text-accent">{stats.averageEntropyReached.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Entropy</div>
            </CardContent>
          </Card>

          <Card className="hud-panel border-secondary/30">
            <CardContent className="pt-6 text-center">
              <Skull className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <div className="text-3xl font-bold text-secondary">{stats.maxWinStreak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Win/Loss Distribution */}
          <Card className="hud-panel">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Win/Loss Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalGamesPlayed > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
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
          <Card className="hud-panel">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Entropy Reached per Game</CardTitle>
            </CardHeader>
            <CardContent>
              {entropyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={entropyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="game" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
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
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Play games to see entropy trends
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sanity Loss Trends */}
          <Card className="hud-panel">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Sanity Lost per Game</CardTitle>
            </CardHeader>
            <CardContent>
              {sanityLossData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sanityLossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="game" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: '#000000' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Bar 
                      dataKey="loss" 
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Play games to see sanity trends
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Games Performance */}
          <Card className="hud-panel">
            <CardHeader>
              <CardTitle className="text-sm font-game tracking-wider">Recent Game Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={recentGames}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="game" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: '#000000' }}
                      formatter={(value, name, props) => [
                        <span style={{ color: props.payload.won ? '#22c55e' : '#ef4444' }}>{props.payload.won ? '✓ Won' : '✗ Lost'}</span>
                      ]}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[4, 4, 0, 0]}
                    >
                      {recentGames.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.won ? 'hsl(var(--success))' : 'hsl(var(--secondary))'} 
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
              <div className="text-lg font-bold text-secondary">{stats.maxLossStreak}</div>
              <div className="text-xs text-muted-foreground">Worst Loss Streak</div>
            </CardContent>
          </Card>
        </div>
          </>
        ) : (
          <UserAnalyticsDashboard />
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
