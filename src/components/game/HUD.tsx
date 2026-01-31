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
}

const HUD = memo(({ score, phase, entropy, sanity, timeRemaining }: HUDProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];
  const maxTime = phaseConfig.timerDuration;
  const timerPercent = (timeRemaining / maxTime) * 100;

  // Determine timer color based on remaining time
  const timerColor = useMemo(() => {
    if (timerPercent > 60) return 'bg-success';
    if (timerPercent > 30) return 'bg-warning';
    return 'bg-destructive';
  }, [timerPercent]);

  // Sanity color
  const sanityColor = useMemo(() => {
    if (sanity > 60) return 'bg-primary';
    if (sanity > 30) return 'bg-warning';
    return 'bg-destructive';
  }, [sanity]);

  // Entropy color (higher = more dangerous)
  const entropyColor = useMemo(() => {
    if (entropy < 40) return 'bg-primary';
    if (entropy < 70) return 'bg-secondary';
    return 'bg-destructive';
  }, [entropy]);

  return (
    <div className="grid gap-3">
      {/* Score */}
      <div className="hud-panel p-3 text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</div>
        <div className={cn(
          "hud-value text-2xl",
          score < 0 && "text-destructive",
          score > 50 && "neon-text"
        )}>
          {score}
        </div>
      </div>

      {/* Phase */}
      <div className="hud-panel p-3 text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phase</div>
        <div className={cn(
          "font-bold text-sm",
          phase === 1 && "text-primary",
          phase === 2 && "text-secondary",
          phase === 3 && "text-destructive",
          phase === 4 && "text-accent",
          phase === 5 && "text-destructive animate-pulse neon-text-secondary"
        )}>
          {phaseConfig.name}
        </div>
      </div>

      {/* Entropy */}
      <div className="hud-panel p-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 text-center">Entropy</div>
        <div className="flex items-center gap-2">
          <Progress 
            value={entropy} 
            className="h-2 flex-1"
            indicatorClassName={entropyColor}
          />
          <span className="hud-value text-sm w-8">{Math.round(entropy)}</span>
        </div>
      </div>

      {/* Sanity */}
      <div className="hud-panel p-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 text-center">Sanity</div>
        <div className="flex items-center gap-2">
          <Progress 
            value={sanity} 
            className="h-2 flex-1"
            indicatorClassName={sanityColor}
          />
          <span className={cn(
            "hud-value text-sm w-8",
            sanity < 30 && "text-destructive animate-pulse"
          )}>
            {Math.round(sanity)}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="hud-panel p-3 col-span-2 md:col-span-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 text-center">Time</div>
        <div className="flex items-center gap-2">
          <Progress 
            value={timerPercent} 
            className="h-3 flex-1"
            indicatorClassName={cn(timerColor, timerPercent < 30 && "animate-pulse")}
          />
          <span className={cn(
            "hud-value text-lg w-10",
            timerPercent < 30 && "text-destructive animate-pulse"
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
