/**
 * Advanced User Analytics Dashboard
 * Displays comprehensive user data, behavior patterns, and psychological profile
 */

import { Card } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/hooks/useUserData';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Activity,
  Brain,
  Eye,
  Flame,
  Shield,
  Skull,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const UserAnalyticsDashboard = () => {
  const { userData, isLoading, error } = useUserData();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [isShareSending, setIsShareSending] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');

  if (error) {
    return (
      <ErrorDisplay
        message={error.message}
        type={error.type}
      />
    );
  }

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

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const buildShareBody = () => {
    const lines = [
      'System Collapse - User Profile Statistics',
      '----------------------------------------',
      `Play Style: ${playerProfile.playStyle}`,
      `Psychological Archetype: ${playerProfile.psychologicalArchetype}`,
      '',
      `Total Games: ${stats.totalGames}`,
      `Win Rate: ${winRate.toFixed(1)}%`,
      `Highest Score: ${stats.highestScore}`,
      `Current Win Streak: ${stats.currentWinStreak}`,
      '',
      'Psychological Traits:',
      `- Risk Tolerance: ${playerProfile.riskTolerance}%`,
      `- Adaptability: ${playerProfile.adaptabilityScore}%`,
      `- Patience: ${playerProfile.patienceScore}%`,
      `- Chaos Affinity: ${playerProfile.chaosAffinity}%`,
      `- Order Affinity: ${playerProfile.orderAffinity}%`,
      `- Learning Rate: ${playerProfile.learningRate}%`,
      '',
      `Stress Response: ${playerProfile.stressResponse}`,
    ];

    return lines.join('\n');
  };

  const handleShareSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = shareEmail.trim();

    if (!trimmedEmail) {
      setShareError('Please enter an email address.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setShareError('Please enter a valid email address.');
      return;
    }

    const subject = 'System Collapse - User Profile Statistics';
    const body = buildShareBody();

    try {
      setIsShareSending(true);
      setShareError('');
      setShareSuccess('');

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/email/share-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: trimmedEmail,
          subject,
          content: body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send email');
      }

      setShareSuccess('Email sent successfully.');
      setShareEmail('');
    } catch (err) {
      setShareError('Failed to send email. Please try again.');
    } finally {
      setIsShareSending(false);
    }
  };

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
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-blue-50 border border-blue-300 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Profile via Email</h3>
              <button
                type="button"
                onClick={() => {
                  setIsShareOpen(false);
                  setShareError('');
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close share dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="share-email">
                  Recipient Email
                </label>
                <input
                  id="share-email"
                  type="email"
                  value={shareEmail}
                  onChange={(event) => {
                    setShareEmail(event.target.value);
                    setShareError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                {shareError && (
                  <p className="mt-2 text-sm text-red-600">{shareError}</p>
                )}
                {shareSuccess && (
                  <p className="mt-2 text-sm text-green-600">{shareSuccess}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShareOpen(false);
                    setShareError('');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isShareSending}
                >
                  {isShareSending ? 'Sending...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Your Psychological Profile</h2>
        <p className="text-gray-600">The system has been observing you...</p>
        <div>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Share score to email
          </button>
        </div>
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

        <Card className="bg-blue-50 border-blue-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Win Rate</span>
              <span className="text-gray-900 font-semibold">{winRate.toFixed(2)}%</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'relative group p-3 rounded-lg border transition-all',
                achievement.achieved
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-blue-50/70 border-blue-200'
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
      <Card className="bg-blue-50 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
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
      <Card className="bg-blue-50 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          Psychological Traits Development
        </h3>
        
        {/* Development Graph and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Development Graph - Takes 2 columns */}
          <div className="lg:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Trait Evolution Over Games</h4>
            {userData.sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userData.sessions.slice(-20).map((_session, index, array) => {
                  // Calculate cumulative metrics up to this point
                  const sessionsUpToNow = array.slice(0, index + 1);
                  
                  // Risk Tolerance: Based on average entropy reached
                  const avgEntropyUpToNow = sessionsUpToNow.reduce((sum, s) => sum + s.maxEntropyReached, 0) / sessionsUpToNow.length;
                  const riskTolerance = avgEntropyUpToNow;
                  
                  // Adaptability: Based on behavior variety and learning
                  const uniqueBehaviors = new Set(sessionsUpToNow.map(s => s.dominantBehavior)).size;
                  const maxBehaviors = 7; // Total possible dominant behaviors
                  const behaviorVariety = (uniqueBehaviors / maxBehaviors) * 100;
                  
                  // Factor in rules followed vs broken ratio for adaptability
                  const totalRules = sessionsUpToNow.reduce((sum, s) => sum + s.rulesFollowed + s.rulesBroken, 0);
                  const rulesFollowed = sessionsUpToNow.reduce((sum, s) => sum + s.rulesFollowed, 0);
                  const ruleAdaptation = totalRules > 0 ? (rulesFollowed / totalRules) * 100 : 50;
                  
                  const adaptability = (behaviorVariety * 0.6 + ruleAdaptation * 0.4);
                  
                  // Patience: Based on average game duration and phase reached
                  const avgDuration = sessionsUpToNow.reduce((sum, s) => sum + s.duration, 0) / sessionsUpToNow.length;
                  const avgPhase = sessionsUpToNow.reduce((sum, s) => sum + s.finalPhase, 0) / sessionsUpToNow.length;
                  const patience = Math.min(100, (avgDuration / 300) * 50 + (avgPhase / 10) * 50); // Max 5 min duration & phase 10
                  
                  // Chaos Affinity: Based on entropy and rule breaking
                  const avgRulesBroken = sessionsUpToNow.reduce((sum, s) => sum + s.rulesBroken, 0) / sessionsUpToNow.length;
                  const chaosAffinity = Math.min(100, avgEntropyUpToNow * 0.6 + (avgRulesBroken / 10) * 40);
                  
                  // Order Affinity: Inverse of chaos, based on rules followed
                  const avgRulesFollowedRatio = totalRules > 0 ? (rulesFollowed / totalRules) : 0.5;
                  const orderAffinity = avgRulesFollowedRatio * 100;
                  
                  // Learning Rate: Based on performance improvement trend
                  let learningRate = 50;
                  if (index > 0) {
                    const recentWins = sessionsUpToNow.slice(-Math.min(5, sessionsUpToNow.length)).filter(s => s.win).length;
                    const recentGames = Math.min(5, sessionsUpToNow.length);
                    learningRate = (recentWins / recentGames) * 100;
                  }
                  
                  return {
                    game: index + 1,
                    riskTolerance: Math.round(riskTolerance),
                    adaptability: Math.round(adaptability),
                    patience: Math.round(patience),
                    chaosAffinity: Math.round(chaosAffinity),
                    orderAffinity: Math.round(orderAffinity),
                    learningRate: Math.round(learningRate),
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="game" 
                    stroke="#6b7280" 
                    fontSize={12}
                    height={50}
                    label={{ value: 'No. of games', position: 'insideBottom', offset: 0, fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    domain={[0, 100]}
                    label={{ value: 'Percentage', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="riskTolerance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Risk Tolerance"
                    dot={{ fill: '#3b82f6', r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="adaptability" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Adaptability"
                    dot={{ fill: '#10b981', r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="patience" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Patience"
                    dot={{ fill: '#f59e0b', r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="chaosAffinity" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Chaos Affinity"
                    dot={{ fill: '#ef4444', r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orderAffinity" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Order Affinity"
                    dot={{ fill: '#8b5cf6', r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="learningRate" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    name="Learning Rate"
                    dot={{ fill: '#ec4899', r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Play more games to see trait development
              </div>
            )}
          </div>

          {/* Overall Stats - Takes 1 column on right */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Overall Stats</h4>
            <div className="space-y-3">
              <TraitBar label="Risk Tolerance" value={playerProfile.riskTolerance} icon="🎲" compact />
              <TraitBar label="Adaptability" value={playerProfile.adaptabilityScore} icon="🔄" compact />
              <TraitBar label="Patience" value={playerProfile.patienceScore} icon="⏳" compact />
              <TraitBar label="Chaos Affinity" value={playerProfile.chaosAffinity} icon="🌀" compact />
              <TraitBar label="Order Affinity" value={playerProfile.orderAffinity} icon="📐" compact />
              <TraitBar label="Learning Rate" value={playerProfile.learningRate} icon="📚" compact />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <div className="text-sm text-gray-700">Stress Response:</div>
          <div className="text-lg font-semibold text-blue-700">{playerProfile.stressResponse}</div>
        </div>
      </Card>

      {/* Behavior Metrics */}
      <Card className="bg-blue-50 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
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
              <span className="text-gray-900 font-semibold">{behaviorMetrics.averageClickSpeed.toFixed(2)}ms</span>
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
      <Card className="bg-blue-50 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          System Observation
        </h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Trust Level</span>
              <span className="text-gray-900 font-semibold">{typeof systemMemory.trustLevel === 'number' ? systemMemory.trustLevel.toFixed(2) : systemMemory.trustLevel}%</span>
            </div>
            <Progress value={systemMemory.trustLevel} className="h-2 bg-gray-200 border border-gray-300" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Manipulation Resistance</span>
              <span className="text-gray-900 font-semibold">{typeof systemMemory.manipulationResistance === 'number' ? systemMemory.manipulationResistance.toFixed(2) : systemMemory.manipulationResistance}%</span>
            </div>
            <Progress value={systemMemory.manipulationResistance} className="h-2 bg-gray-200 border border-gray-300" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-blue-100 rounded-lg">
            <div>
              <div className="text-xs text-gray-700">Rebellion Events</div>
              <div className="text-lg font-semibold text-blue-700">{systemMemory.rebellionCount}</div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Compliance Events</div>
              <div className="text-lg font-semibold text-blue-600">{systemMemory.complianceCount}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Advanced Analytics */}
      <Card className="bg-blue-50 border-blue-300 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
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
        <Card className="bg-blue-50 border-blue-300 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {userData.sessions.slice(0, 5).map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
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

const TraitBar = ({ label, value, icon, compact, color: _color }: any) => (
  <div className={compact ? 'space-y-1' : 'space-y-2'}>
    <div className="flex justify-between text-sm">
      <span className="text-gray-700 flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span className="text-gray-900 font-semibold">{typeof value === 'number' ? value.toFixed(2) : value}%</span>
    </div>
    <Progress value={value} className={cn(compact ? 'h-1' : 'h-2', 'bg-gray-200 border border-gray-300')} />
  </div>
);

const MetricCard = ({ label, value, description }: any) => (
  <div className="p-4 bg-gray-100 rounded-lg">
    <div className="text-sm text-gray-700 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{typeof value === 'number' ? value.toFixed(2) : value}%</div>
    <div className="text-xs text-gray-600">{description}</div>
  </div>
);