/**
 * Game Tile Component
 * Renders individual clickable tiles with chaos effects
 */

import { cn } from '@/lib/utils';
import { GamePhase, PHASE_CONFIGS, TileState } from '@/types/game';
import { memo, useMemo } from 'react';

interface GameTileProps {
  tile: TileState;
  phase: GamePhase;
  entropy: number;
  sanity: number;
  onClick: (tileId: number) => void;
}

const GameTile = memo(({ tile, phase, entropy, sanity, onClick }: GameTileProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];

  // Calculate chaos-based styles
  const chaosStyles = useMemo(() => {
    const chaosLevel = (100 - sanity + entropy) / 200;
    const jitter = phaseConfig.visualEffects.jitter * chaosLevel;
    const blur = phaseConfig.visualEffects.blur * chaosLevel;
    const hueShift = phaseConfig.visualEffects.hueShift * chaosLevel;

    return {
      '--chaos-jitter': `${jitter}px`,
      '--chaos-blur': `${blur}px`,
      '--chaos-hue-shift': `${hueShift}deg`,
      '--chaos-opacity': phaseConfig.visualEffects.opacity,
      transform: tile.drift.x || tile.drift.y
        ? `translate(${tile.drift.x}px, ${tile.drift.y}px) rotate(${tile.rotation}deg)`
        : undefined,
    } as React.CSSProperties;
  }, [phase, entropy, sanity, tile.drift, tile.rotation, phaseConfig]);

  // Animation classes based on phase
  const animationClass = useMemo(() => {
    if (tile.isShaking) return 'animate-shake';
    if (phase >= 5) return 'animate-jitter';
    if (phase >= 4 && Math.random() > 0.7) return 'animate-pulse-glow';
    if (phase >= 3 && entropy > 60) return 'animate-warp';
    return '';
  }, [phase, entropy, tile.isShaking]);

  // Color class mapping
  const colorClass = {
    red: 'tile-red',
    blue: 'tile-blue',
    green: 'tile-green',
    yellow: 'tile-yellow',
  }[tile.color];

  return (
    <button
      onClick={() => onClick(tile.id)}
      style={chaosStyles}
      className={cn(
        'tile-base w-full aspect-square',
        colorClass,
        animationClass,
        phase >= 3 && 'hover:scale-110',
        phase >= 4 && 'hover:animate-pulse-glow',
        phase >= 5 && sanity < 30 && 'animate-flicker',
        'transition-all duration-150 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
      )}
      aria-label={`${tile.color} tile`}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-br from-foreground/10 to-transparent" />
      
      {/* Chaos overlay for high entropy */}
      {entropy > 70 && (
        <div 
          className="absolute inset-0 rounded-lg animate-color-drift opacity-30"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
    </button>
  );
});

GameTile.displayName = 'GameTile';

export default GameTile;
