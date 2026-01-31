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
  beatPulse?: boolean;
  isExploding?: boolean;
  scatterAmount?: number;
  isBeatDropped?: boolean;
  isPreDrop?: boolean;
}

const GameTile = memo(({ tile, phase, entropy, sanity, onClick, beatPulse, isExploding, scatterAmount, isBeatDropped, isPreDrop }: GameTileProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];

  // Calculate chaos-based styles
  const chaosStyles = useMemo(() => {
    const chaosLevel = (100 - sanity + entropy) / 200;
    const jitter = phaseConfig.visualEffects.jitter * chaosLevel;
    const blur = phaseConfig.visualEffects.blur * chaosLevel;
    const hueShift = phaseConfig.visualEffects.hueShift * chaosLevel;

    const styles: React.CSSProperties = {
      '--chaos-jitter': `${jitter}px`,
      '--chaos-blur': `${blur}px`,
      '--chaos-hue-shift': `${hueShift}deg`,
      '--chaos-opacity': phaseConfig.visualEffects.opacity,
      transform: tile.drift.x || tile.drift.y
        ? `translate(${tile.drift.x}px, ${tile.drift.y}px) rotate(${tile.rotation}deg)`
        : undefined,
    };

    // Add scatter effect during explosion
    if (isExploding && scatterAmount) {
      const angle = (tile.id * Math.PI) / 8 + Math.random() * 0.5; // Unique angle per tile
      const distance = scatterAmount * (0.8 + Math.random() * 0.4);
      styles['--scatter-x' as any] = `${Math.cos(angle) * distance}px`;
      styles['--scatter-y' as any] = `${Math.sin(angle) * distance}px`;
      styles['--scatter-rotate' as any] = `${(Math.random() - 0.5) * 360}deg`;
    }

    return styles;
  }, [phase, entropy, sanity, tile.drift, tile.rotation, tile.id, phaseConfig, isExploding, scatterAmount]);

  // Animation classes based on phase
  const animationClass = useMemo(() => {
    const classes = [];
    
    // Vibration animations
    if (isPreDrop) classes.push('animate-vibrate-light');
    if (isBeatDropped && !isExploding) classes.push('animate-vibrate-intense');
    
    if (beatPulse && isBeatDropped) classes.push('animate-beat-pulse');
    if (isExploding) classes.push('animate-explosion-scatter');
    if (tile.isShaking) classes.push('animate-shake');
    if (phase >= 5) classes.push('animate-jitter');
    if (phase >= 4 && Math.random() > 0.7) classes.push('animate-pulse-glow');
    if (phase >= 3 && entropy > 60) classes.push('animate-warp');
    if (isBeatDropped) classes.push('animate-neon-intensity');
    
    return classes.join(' ');
  }, [phase, entropy, tile.isShaking, beatPulse, isExploding, isBeatDropped, isPreDrop]);

  // Color class mapping
  const colorClass = {
    red: 'tile-red',
    blue: 'tile-blue',
    green: 'tile-green',
    yellow: 'tile-yellow',
  }[tile.color];

  // Enhanced neon effect after beat drop
  const neonClass = isBeatDropped ? 'neon-glow' : '';

  return (
    <button
      onClick={() => onClick(tile.id)}
      style={chaosStyles}
      className={cn(
        'tile-base w-full aspect-square',
        colorClass,
        neonClass,
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
