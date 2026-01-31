/**
 * Advanced User Analytics Dashboard
 * Displays comprehensive user data, behavior patterns, and psychological profile
 */

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/hooks/useUserData';
import {
    Activity,
    Brain,
    Eye,
    Flame,
    Shield,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect } from 'react';

export const UserAnalyticsDashboard = () => {
  const { userData, isLoading, refetch } = useUserData();

  // Refetch data whenever this component mounts to ensure latest data
  useEffect(() => {
    refetch();
  }, [refetch]);

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
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-foreground animate-pulse">
                Analyzing User Data...
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="flex gap-1">
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
            <Progress value={winRate} className="h-2" />
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
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Trust Level</span>
            <div className="flex items-center gap-2">
              <Progress value={systemMemory.trustLevel} className="w-32 h-2" />
              <span className="text-gray-900 font-semibold w-12">{systemMemory.trustLevel}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Manipulation Resistance</span>
            <div className="flex items-center gap-2">
              <Progress value={systemMemory.manipulationResistance} className="w-32 h-2" />
              <span className="text-gray-900 font-semibold w-12">{systemMemory.manipulationResistance}%</span>
            </div>
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
    <Progress value={value} className={compact ? 'h-1' : 'h-2'} />
  </div>
);

const MetricCard = ({ label, value, description }: any) => (
  <div className="p-4 bg-gray-100 rounded-lg">
    <div className="text-sm text-gray-700 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}%</div>
    <div className="text-xs text-gray-600">{description}</div>
  </div>
);
