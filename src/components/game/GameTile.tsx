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
  beatIntensity?: number;
  gridShake?: number;
  isExploding?: boolean;
  scatterAmount?: number;
  isBeatDropped?: boolean;
  isPreDrop?: boolean;
}

const GameTile = memo(({ tile, phase, entropy, sanity, onClick, beatPulse, beatIntensity = 0, gridShake = 0, isExploding, scatterAmount, isBeatDropped, isPreDrop }: GameTileProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];

  // Calculate chaos-based styles
  const chaosStyles = useMemo(() => {
    const chaosLevel = (100 - sanity + entropy) / 200;
    const jitter = phaseConfig.visualEffects.jitter * chaosLevel;
    const blur = phaseConfig.visualEffects.blur * chaosLevel;
    const hueShift = phaseConfig.visualEffects.hueShift * chaosLevel;

    // Generate unique random vibration per tile based on tile ID
    let vibrateX = 0;
    let vibrateY = 0;
    let vibrateRotate = 0;
    
    if (gridShake > 0) {
      // Use tile ID as seed for consistent random values per tile
      const seed = tile.id * 12.9898;
      const frac1 = Math.sin(seed) * 43758.5453;
      const frac2 = Math.sin(seed + 1.0) * 43758.5453;
      const frac3 = Math.sin(seed + 2.0) * 43758.5453;
      
      const rand1 = frac1 - Math.floor(frac1);
      const rand2 = frac2 - Math.floor(frac2);
      const rand3 = frac3 - Math.floor(frac3);
      
      vibrateX = (rand1 - 0.5) * gridShake * 1.5;
      vibrateY = (rand2 - 0.5) * gridShake * 1.5;
      vibrateRotate = (rand3 - 0.5) * 3;
    }

    const styles: React.CSSProperties = {
      '--chaos-jitter': `${jitter}px`,
      '--chaos-blur': `${blur}px`,
      '--chaos-hue-shift': `${hueShift}deg`,
      '--chaos-opacity': `${phaseConfig.visualEffects.opacity}`,
      transform: tile.drift.x || tile.drift.y || gridShake > 0
        ? `translate(${(tile.drift.x || 0) + vibrateX}px, ${(tile.drift.y || 0) + vibrateY}px) rotate(${(tile.rotation || 0) + vibrateRotate}deg)`
        : undefined,
    } as React.CSSProperties & Record<string, any>;

    // Add RGB glow effect on beat
    if (beatIntensity > 0) {
      const glowColor = tile.color === 'red' ? 'rgb(255, 0, 0)' :
                        tile.color === 'blue' ? 'rgb(0, 100, 255)' :
                        tile.color === 'green' ? 'rgb(0, 255, 0)' :
                        'rgb(255, 255, 0)';
      (styles as any)['--beat-glow'] = glowColor;
      (styles as any)['--beat-glow-intensity'] = beatIntensity;
    }

    // Add scatter effect during explosion
    if (isExploding && scatterAmount) {
      const angle = (tile.id * Math.PI) / 8 + Math.random() * 0.5;
      const distance = scatterAmount * (0.8 + Math.random() * 0.4);
      (styles as any)['--scatter-x'] = `${Math.cos(angle) * distance}px`;
      (styles as any)['--scatter-y'] = `${Math.sin(angle) * distance}px`;
      (styles as any)['--scatter-rotate'] = `${(Math.random() - 0.5) * 360}deg`;
    }

    return styles;
  }, [phase, entropy, sanity, tile.drift, tile.rotation, tile.id, tile.color, phaseConfig, beatIntensity, gridShake, isExploding, scatterAmount]);

  // Animation classes based on phase
  const animationClass = useMemo(() => {
    const classes = [];
    
    // Vibration animations
    if (isPreDrop) classes.push('animate-vibrate-light');
    if (isBeatDropped && !isExploding) classes.push('animate-vibrate-intense');
    
    // Beat-based dance animations with RGB glow
    if (beatPulse && beatIntensity > 0) {
      const danceVariant = (tile.id % 4) + 1; // 4 different dance patterns
      classes.push(`animate-tile-beat-dance-${danceVariant}`);
      classes.push('animate-tile-rgb-glow');
    }
    
    if (isExploding) classes.push('animate-explosion-scatter');
    if (tile.isShaking) classes.push('animate-shake');
    if (phase >= 5) classes.push('animate-jitter');
    if (phase >= 4 && Math.random() > 0.7) classes.push('animate-pulse-glow');
    if (phase >= 3 && entropy > 60) classes.push('animate-warp');
    
    return classes.join(' ');
  }, [phase, entropy, tile.id, tile.isShaking, beatPulse, beatIntensity, isExploding, isPreDrop, isBeatDropped]);

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
        'transition-all duration-150 active:scale-95 active:brightness-125',
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
