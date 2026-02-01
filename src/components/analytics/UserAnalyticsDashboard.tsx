/**
 * Advanced User Analytics Dashboard
 * Displays comprehensive user data, behavior patterns, and psychological profile
 */

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/hooks/useUserData';
import { cn } from '@/lib/utils';
import {
  Activity,
  Brain,
  Eye,
  Flame,
  Skull,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap
} from 'lucide-react';

export const UserAnalyticsDashboard = () => {
  const { userData, isLoading } = useUserData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div className="w-32 h-32 bg-primary rounded-full animate-pulse" />
          </div>
          
          {/* Loading spinner */}
          <div className="relative flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              {/* Outer ring */}
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
              {/* Spinning ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
              {/* Inner pulse */}
              <div className="absolute inset-2 bg-primary/20 rounded-full animate-pulse" />
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="text-lg font-semibold text-foreground animate-pulse">
                Analyzing User Data...
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 w-full">
                <div className="flex gap-1 items-center justify-center">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, trends, playerProfile, systemMemory, behaviorMetrics, analytics } = userData;

  const winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;

  const achievements = [
    {
      id: 'first-spark',
      name: 'First Spark',
      description: 'Complete your first game session.',
      achieved: stats.totalGames >= 1,
    },
    {
      id: 'score-breaker',
      name: 'Score Breaker',
      description: 'Score 500 or more in a single run.',
      achieved: stats.highestScore >= 500,
    },
    {
      id: 'streak-shaper',
      name: 'Streak Shaper',
      description: 'Reach a 3-win streak.',
      achieved: stats.longestWinStreak >= 3,
    },
    {
      id: 'entropy-surfer',
      name: 'Entropy Surfer',
      description: 'Hit 80% or higher entropy.',
      achieved: (trends.entropyHistory || []).some((value) => value >= 80),
    },
    {
      id: 'palette-explorer',
      name: 'Palette Explorer',
      description: 'Achieve 70%+ variety score.',
      achieved: behaviorMetrics.varietyScore >= 70,
    },
    {
      id: 'steel-nerves',
      name: 'Steel Nerves',
      description: 'Sanity management reaches 70%+.',
      achieved: analytics.sanityManagement >= 70,
    },
    {
      id: 'phoenix-protocol',
      name: 'Phoenix Protocol',
      description: 'Recovery ability reaches 70%+.',
      achieved: analytics.recoveryAbility >= 70,
    },
    {
      id: 'rule-whisperer',
      name: 'Rule Whisperer',
      description: 'Trust level climbs to 70%+.',
      achieved: systemMemory.trustLevel >= 70,
    },
  ];

  const badges = [
    {
      id: 'streak-5',
      name: 'Streak V',
      description: 'Win 5 games in a row.',
      achieved: stats.longestWinStreak >= 5,
      icon: Flame,
      tier: 'silver',
    },
    {
      id: 'streak-10',
      name: 'Streak X',
      description: 'Win 10 games in a row.',
      achieved: stats.longestWinStreak >= 10,
      icon: Zap,
      tier: 'legendary',
    },
    {
      id: 'zero-sanity',
      name: 'Void Touched',
      description: 'Hit 0% sanity at least once.',
      achieved: (trends.sanityHistory || []).some((value) => value <= 0),
      icon: Skull,
      tier: 'gold',
    },
    {
      id: 'adaptive-learner',
      name: 'Adaptive Learner',
      description: 'Adaptability reaches 70%+.',
      achieved: playerProfile.adaptabilityScore >= 70,
      icon: Brain,
      tier: 'silver',
    },
    {
      id: 'entropy-rider',
      name: 'Entropy Rider',
      description: 'Reach 90%+ entropy in a run.',
      achieved: (trends.entropyHistory || []).some((value) => value >= 90),
      icon: Eye,
      tier: 'gold',
    },
    {
      id: 'comeback-core',
      name: 'Comeback Core',
      description: 'Recovery ability reaches 80%+.',
      achieved: analytics.recoveryAbility >= 80,
      icon: TrendingUp,
      tier: 'legendary',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Your Psychological Profile</h2>
        <p className="text-gray-600">The system has been observing you...</p>
      </div>

      {/* Play Style & Archetype */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Play Style</h3>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {playerProfile.playStyle}
          </div>
          <div className="text-sm text-gray-700">
            Psychological Archetype: <span className="text-blue-700">{playerProfile.psychologicalArchetype}</span>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Win Rate</span>
              <span className="text-gray-900 font-semibold">{winRate.toFixed(1)}%</span>
            </div>
            <Progress value={winRate} className="h-2 bg-gray-200 border border-gray-300" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Trend</span>
              <span className={`font-semibold ${
                trends.performanceTrend === 'improving' ? 'text-green-600' :
                trends.performanceTrend === 'declining' ? 'text-red-600' : 'text-amber-600'
              }`}>
                {trends.performanceTrend === 'improving' && '↗ Improving'}
                {trends.performanceTrend === 'declining' && '↘ Declining'}
                {trends.performanceTrend === 'stable' && '→ Stable'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Total Games"
          value={stats.totalGames}
          color="text-blue-600"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Highest Score"
          value={stats.highestScore}
          color="text-green-600"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Win Streak"
          value={stats.currentWinStreak}
          color="text-orange-600"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Collapses"
          value={stats.collapseCount}
          color="text-red-600"
        />
      </div>

      {/* Achievements */}
      <Card className="bg-blue-50 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-600" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'relative group p-3 rounded-lg border transition-all',
                achievement.achieved
                  ? 'bg-white border-green-300 shadow-sm'
                  : 'bg-white/70 border-gray-200'
              )}
              title={achievement.description}
            >
              <div
                className={cn(
                  'absolute top-2 right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold',
                  achievement.achieved
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                )}
              >
                ✓
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {achievement.name}
              </div>
              <div className="absolute z-10 left-1/2 top-full -translate-x-1/2 mt-2 w-48 rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
                {achievement.description}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Badges */}
      <Card className="bg-emerald-50 border-emerald-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            const badgeStyles = {
              'streak-5': {
                gradient: 'from-orange-300 via-rose-300 to-red-400',
                glow: 'shadow-[0_0_16px_rgba(248,113,113,0.65)]',
                ring: 'ring-2 ring-orange-300',
              },
              'streak-10': {
                gradient: 'from-yellow-300 via-amber-400 to-orange-500',
                glow: 'shadow-[0_0_24px_rgba(251,191,36,0.85)]',
                ring: 'ring-2 ring-amber-300',
              },
              'zero-sanity': {
                gradient: 'from-gray-900 via-slate-800 to-black',
                glow: 'shadow-[0_0_22px_rgba(15,23,42,0.85)]',
                ring: 'ring-2 ring-gray-700',
              },
              'adaptive-learner': {
                gradient: 'from-sky-300 via-cyan-300 to-emerald-300',
                glow: 'shadow-[0_0_16px_rgba(56,189,248,0.65)]',
                ring: 'ring-2 ring-cyan-300',
              },
              'entropy-rider': {
                gradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
                glow: 'shadow-[0_0_22px_rgba(216,70,239,0.8)]',
                ring: 'ring-2 ring-fuchsia-300',
              },
              'comeback-core': {
                gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
                glow: 'shadow-[0_0_24px_rgba(34,211,238,0.85)]',
                ring: 'ring-2 ring-teal-300',
              },
            } as const;

            const styles = badgeStyles[badge.id as keyof typeof badgeStyles];
            return (
              <div
                key={badge.id}
                className="relative group flex flex-col items-center gap-2"
                title={badge.description}
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center rounded-full border transition-all',
                    'w-16 h-16 md:w-20 md:h-20',
                    'bg-gradient-to-br',
                    styles.gradient,
                    badge.tier === 'silver' && 'border-slate-300',
                    badge.tier === 'gold' && 'border-amber-400',
                    badge.tier === 'legendary' && 'border-fuchsia-400 scale-110',
                    badge.achieved ? styles.glow : '',
                    badge.achieved ? styles.ring : '',
                    badge.achieved ? 'opacity-100' : 'opacity-40 grayscale'
                  )}
                >
                  <Icon className={cn('w-7 h-7 md:w-8 md:h-8 text-white drop-shadow-sm')} />
                  <div
                    className={cn(
                      'absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold',
                      badge.achieved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    )}
                  >
                    ✓
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-900 text-center">
                  {badge.name}
                </div>
                <div className="absolute z-10 left-1/2 top-full -translate-x-1/2 mt-2 w-52 rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Psychological Traits */}
      <Card className="bg-purple-50 border-purple-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Psychological Traits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TraitBar label="Risk Tolerance" value={playerProfile.riskTolerance} icon="🎲" />
          <TraitBar label="Adaptability" value={playerProfile.adaptabilityScore} icon="🔄" />
          <TraitBar label="Patience" value={playerProfile.patienceScore} icon="⏳" />
          <TraitBar label="Chaos Affinity" value={playerProfile.chaosAffinity} icon="🌀" />
          <TraitBar label="Order Affinity" value={playerProfile.orderAffinity} icon="📐" />
          <TraitBar label="Learning Rate" value={playerProfile.learningRate} icon="📚" />
        </div>
        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
          <div className="text-sm text-gray-700">Stress Response:</div>
          <div className="text-lg font-semibold text-purple-700">{playerProfile.stressResponse}</div>
        </div>
      </Card>

      {/* Behavior Metrics */}
      <Card className="bg-orange-50 border-orange-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-600" />
          Behavioral Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Total Clicks</span>
              <span className="text-gray-900 font-semibold">{behaviorMetrics.totalClicks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Avg Click Speed</span>
              <span className="text-gray-900 font-semibold">{behaviorMetrics.averageClickSpeed.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Most Clicked</span>
              <span className="text-gray-900 font-semibold capitalize">{behaviorMetrics.mostClickedColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <TraitBar label="Variety" value={behaviorMetrics.varietyScore} compact />
            <TraitBar label="Hesitation" value={behaviorMetrics.hesitationScore} compact />
            <TraitBar label="Impulsivity" value={behaviorMetrics.impulsivityScore} compact />
            <TraitBar label="Pattern Adherence" value={behaviorMetrics.patternAdherence} compact />
          </div>
        </div>
      </Card>

      {/* System Interaction */}
      <Card className="bg-red-50 border-red-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-600" />
          System Observation
        </h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Trust Level</span>
              <span className="text-gray-900 font-semibold">{systemMemory.trustLevel}%</span>
            </div>
            <Progress value={systemMemory.trustLevel} className="h-2 bg-gray-200 border border-gray-300" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Manipulation Resistance</span>
              <span className="text-gray-900 font-semibold">{systemMemory.manipulationResistance}%</span>
            </div>
            <Progress value={systemMemory.manipulationResistance} className="h-2 bg-gray-200 border border-gray-300" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-red-100 rounded-lg">
            <div>
              <div className="text-xs text-gray-700">Rebellion Events</div>
              <div className="text-lg font-semibold text-red-600">{systemMemory.rebellionCount}</div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Compliance Events</div>
              <div className="text-lg font-semibold text-green-600">{systemMemory.complianceCount}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Advanced Analytics */}
      <Card className="bg-cyan-50 border-cyan-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-600" />
          Advanced Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Entropy Resistance"
            value={analytics.entropyResistance}
            description="How well you handle chaos"
          />
          <MetricCard
            label="Sanity Management"
            value={analytics.sanityManagement}
            description="Mental stability control"
          />
          <MetricCard
            label="Recovery Ability"
            value={analytics.recoveryAbility}
            description="Bounce back from errors"
          />
        </div>
      </Card>

      {/* Recent Sessions */}
      {userData.sessions.length > 0 && (
        <Card className="bg-purple-50 border-purple-300 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {userData.sessions.slice(0, 5).map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${session.win ? 'bg-green-600' : 'bg-red-600'}`} />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Phase {session.finalPhase} - Score: {session.finalScore}</div>
                    <div className="text-xs text-gray-700 capitalize">{session.dominantBehavior} behavior</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(session.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color }: any) => (
  <Card className="bg-blue-50 border-blue-300 p-4">
    <div className={`flex items-center gap-2 mb-2 ${color}`}>
      {icon}
      <span className="text-xs text-gray-700">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </Card>
);

const TraitBar = ({ label, value, icon, compact }: any) => (
  <div className={compact ? 'space-y-1' : 'space-y-2'}>
    <div className="flex justify-between text-sm">
      <span className="text-gray-700 flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span className="text-gray-900 font-semibold">{value}%</span>
    </div>
    <Progress value={value} className={cn(compact ? 'h-1' : 'h-2', 'bg-gray-200 border border-gray-300')} />
  </div>
);

const MetricCard = ({ label, value, description }: any) => (
  <div className="p-4 bg-gray-100 rounded-lg">
    <div className="text-sm text-gray-700 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}%</div>
    <div className="text-xs text-gray-600">{description}</div>
  </div>
);
