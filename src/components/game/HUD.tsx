/**
 * HUD Component
 * Displays game stats: Score, Phase, Entropy, Sanity, Timer
 */

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GamePhase, PHASE_CONFIGS } from '@/types/game';
import { memo, useMemo } from 'react';

interface HUDProps {
  score: number;
  phase: GamePhase;
  entropy: number;
  sanity: number;
  timeRemaining: number;
  playTimeSeconds: number;
  beatPulse?: boolean;
  isBeatDropped?: boolean;
  showPhase?: boolean;
  collapseCount?: number;
}

const HUD = memo(({ score, phase, entropy, sanity, timeRemaining, playTimeSeconds, beatPulse, isBeatDropped, showPhase = true, collapseCount: _collapseCount = 0 }: HUDProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];
  const maxTime = phaseConfig.timerDuration;
  const timerPercent = (timeRemaining / maxTime) * 100;

  const formattedPlayTime = useMemo(() => {
    const minutes = Math.floor(playTimeSeconds / 60);
    const seconds = Math.floor(playTimeSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [playTimeSeconds]);

  // Determine timer color based on remaining time
  const timerColor = useMemo(() => {
    if (timerPercent > 60) return 'bg-green-500';
    if (timerPercent > 30) return 'bg-amber-500';
    return 'bg-red-500';
  }, [timerPercent]);

  // Sanity color
  const sanityColor = useMemo(() => {
    if (sanity > 60) return 'bg-blue-500';
    if (sanity > 30) return 'bg-amber-500';
    return 'bg-red-500';
  }, [sanity]);

  // Entropy color (higher = more dangerous)
  const entropyColor = useMemo(() => {
    if (entropy < 40) return 'bg-blue-500';
    if (entropy < 70) return 'bg-orange-500';
    return 'bg-red-500';
  }, [entropy]);

  return (
    <div className={cn(
      "grid gap-3",
      beatPulse && isBeatDropped && "animate-beat-pulse"
    )}>
      {/* Play Time */}
      <div className="hud-panel p-3 col-span-2 md:col-span-1 bg-blue-50 border-blue-300">
        <div className="text-xs text-gray-700 uppercase tracking-wider mb-1 text-center">Play Time</div>
        <div className="text-center">
          <span className="hud-value text-lg text-gray-900">{formattedPlayTime}</span>
        </div>
      </div>

      {/* Score */}
      <div className="hud-panel p-3 text-center bg-blue-50 border-blue-300" data-tour="game-score">
        <div className="text-xs text-gray-700 uppercase tracking-wider mb-1">Score</div>
        <div className={cn(
          "hud-value text-2xl text-gray-900",
          score < 0 && "text-red-600",
          score > 50 && "text-green-600"
        )}>
          {score}
        </div>
      </div>

      {showPhase && (
        <div className="hud-panel p-3 text-center bg-blue-50 border-blue-300">
          <div className="text-xs text-gray-700 uppercase tracking-wider mb-1">Phase</div>
          <div className={cn(
            "font-bold text-sm",
            phase === 1 && "text-blue-600",
            phase === 2 && "text-orange-600",
            phase === 3 && "text-red-600",
            phase === 4 && "text-purple-600",
            phase === 5 && "text-red-600 animate-pulse"
          )}>
            {phaseConfig.name}
          </div>
        </div>
      )}

      {/* Entropy */}
      <div className="hud-panel p-3 bg-blue-50 border-blue-300" data-tour="game-entropy">
        <div className="text-xs text-gray-700 uppercase tracking-wider mb-1 text-center">Entropy</div>
        <div className="flex items-center gap-2">
          <Progress 
            value={entropy} 
            className="h-2 flex-1 bg-gray-200 border border-gray-300"
            indicatorClassName={entropyColor}
          />
          <span className="hud-value text-sm w-8 text-gray-900">{Math.round(entropy)}</span>
        </div>
      </div>

      {/* Sanity */}
      <div className="hud-panel p-3 bg-blue-50 border-blue-300" data-tour="game-sanity">
        <div className="text-xs text-gray-700 uppercase tracking-wider mb-1 text-center">Sanity</div>
        <div className="flex items-center gap-2">
          <Progress 
            value={sanity} 
            className="h-2 flex-1 bg-gray-200 border border-gray-300"
            indicatorClassName={sanityColor}
          />
          <span className={cn(
            "hud-value text-sm w-8 text-gray-900",
            sanity < 30 && "text-red-600 animate-pulse"
          )}>
            {Math.round(sanity)}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="hud-panel p-3 col-span-2 md:col-span-1 bg-blue-50 border-blue-300" data-tour="game-timer">
        <div className="text-xs text-gray-700 uppercase tracking-wider mb-1 text-center">Time</div>
        <div className="flex items-center gap-2">
          <Progress 
            value={timerPercent} 
            className="h-3 flex-1 bg-gray-200 border border-gray-300"
            indicatorClassName={cn(timerColor, timerPercent < 30 && "animate-pulse")}
          />
          <span className={cn(
            "hud-value text-lg w-10 text-gray-900",
            timerPercent < 30 && "text-red-600 animate-pulse"
          )}>
            {timeRemaining.toFixed(1)}
          </span>
        </div>
      </div>

    </div>
  );
});

HUD.displayName = 'HUD';

export default HUD;
