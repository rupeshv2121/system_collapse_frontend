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
  enableTourTargets?: boolean;
  isMobile?: boolean;
}

const HUD = memo(({ score, phase, entropy, sanity, timeRemaining, playTimeSeconds, beatPulse, isBeatDropped, showPhase = true, collapseCount = 0, enableTourTargets = false, isMobile = false }: HUDProps) => {
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
      isMobile ? "grid grid-cols-2 gap-1.5" : "grid gap-3",
      beatPulse && isBeatDropped && "animate-beat-pulse"
    )}>
      {/* Score */}
      <div className={cn("hud-panel text-center bg-blue-50 border-blue-300", isMobile ? "p-1.5" : "p-3")} {...(enableTourTargets && { 'data-tour': 'game-score' })}>
        <div className={cn("text-gray-700 uppercase tracking-wider mb-0.5", isMobile ? "text-[9px]" : "text-xs")}>Score</div>
        <div className={cn(
          "hud-value text-gray-900",
          isMobile ? "text-base" : "text-2xl",
          score < 0 && "text-red-600",
          score > 50 && "text-green-600"
        )}>
          {score}
        </div>
      </div>

      {/* Play Time */}
      <div className={cn("hud-panel bg-blue-50 border-blue-300", isMobile ? "p-1.5" : "p-3 col-span-2 md:col-span-1")} {...(enableTourTargets && { 'data-tour': 'game-timer' })}>
        <div className={cn("text-gray-700 uppercase tracking-wider mb-0.5 text-center", isMobile ? "text-[9px]" : "text-xs")}>Time</div>
        <div className="text-center">
          <span className={cn("hud-value text-gray-900", isMobile ? "text-base" : "text-lg")}>{formattedPlayTime}</span>
        </div>
      </div>

      {showPhase && (
        <div className={cn("hud-panel p-3 text-center bg-blue-50 border-blue-300", isMobile ? "p-1.5" : "p-3")} {...(enableTourTargets && { 'data-tour': 'game-phase' })}>
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
      <div className={cn("hud-panel bg-blue-50 border-blue-300", isMobile ? "p-1.5" : "p-3")} {...(enableTourTargets && { 'data-tour': 'game-entropy' })}>
        <div className={cn("text-gray-700 uppercase tracking-wider mb-0.5 text-center", isMobile ? "text-[9px]" : "text-xs")}>Entropy</div>
        <div className="flex items-center gap-1.5">
          <Progress 
            value={entropy} 
            className={cn("flex-1 bg-gray-200 border border-gray-300", isMobile ? "h-1.5" : "h-2")}
            indicatorClassName={entropyColor}
          />
          <span className={cn("hud-value text-gray-900", isMobile ? "text-xs w-6" : "text-sm w-8")}>{Math.round(entropy)}</span>
        </div>
      </div>

      {/* Sanity */}
      <div className={cn("hud-panel bg-blue-50 border-blue-300", isMobile ? "p-1.5" : "p-3")} {...(enableTourTargets && { 'data-tour': 'game-sanity' })}>
        <div className={cn("text-gray-700 uppercase tracking-wider mb-0.5 text-center", isMobile ? "text-[9px]" : "text-xs")}>Sanity</div>
        <div className="flex items-center gap-1.5">
          <Progress 
            value={sanity} 
            className={cn("flex-1 bg-gray-200 border border-gray-300", isMobile ? "h-1.5" : "h-2")}
            indicatorClassName={sanityColor}
          />
          <span className={cn(
            "hud-value text-gray-900",
            isMobile ? "text-xs w-6" : "text-sm w-8",
            sanity < 30 && "text-red-600 animate-pulse"
          )}>
            {Math.round(sanity)}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className={cn("hud-panel bg-blue-50 border-blue-300", isMobile ? "p-1.5 col-span-2" : "p-3 col-span-2 md:col-span-1")} {...(enableTourTargets && { 'data-tour': 'game-round-timer' })}>
        <div className={cn("text-gray-700 uppercase tracking-wider mb-0.5 text-center", isMobile ? "text-[9px]" : "text-xs")}>Time</div>
        <div className="flex items-center gap-1.5">
          <Progress 
            value={timerPercent} 
            className={cn("flex-1 bg-gray-200 border border-gray-300", isMobile ? "h-1.5" : "h-3")}
            indicatorClassName={cn(timerColor, timerPercent < 30 && "animate-pulse")}
          />
          <span className={cn(
            "hud-value text-gray-900",
            isMobile ? "text-xs w-8" : "text-lg w-10",
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
