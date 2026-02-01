/**
 * Game Grid Component
 * Renders the 4x4 tile grid with chaos effects
 */

import { cn } from '@/lib/utils';
import { GamePhase, PHASE_CONFIGS, TileState } from '@/types/game';
import { memo, useMemo } from 'react';
import GameTile from './GameTile';

interface GameGridProps {
  tiles: TileState[];
  phase: GamePhase;
  entropy: number;
  sanity: number;
  onTileClick: (tileId: number) => void;
  beatPulse?: boolean;
  isExploding?: boolean;
  scatterAmount?: number;
  isBeatDropped?: boolean;
  isPreDrop?: boolean;
}

const GameGrid = memo(({ tiles, phase, entropy, sanity, onTileClick, beatPulse, isExploding, scatterAmount, isBeatDropped, isPreDrop }: GameGridProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];

  // Grid chaos effects
  const gridStyles = useMemo(() => {
    const chaosLevel = (100 - sanity + entropy) / 200;
    const blur = phaseConfig.visualEffects.blur * chaosLevel;
    const hueShift = phaseConfig.visualEffects.hueShift * chaosLevel;
    
    const styles: React.CSSProperties = {
      filter: `blur(${blur}px) hue-rotate(${hueShift}deg)`,
      opacity: phaseConfig.visualEffects.opacity,
    };

    // Add scatter variables for explosion effect
    if (isExploding && scatterAmount) {
      const angle = Math.random() * Math.PI * 2;
      const distance = scatterAmount * 0.5; // Grid moves less than tiles
      styles['--scatter-x' as any] = `${Math.cos(angle) * distance}px`;
      styles['--scatter-y' as any] = `${Math.sin(angle) * distance}px`;
      styles['--scatter-rotate' as any] = `${(Math.random() - 0.5) * 15}deg`;
    }
    
    return styles;
  }, [phase, entropy, sanity, phaseConfig, isExploding, scatterAmount]);

  const gridAnimationClass = useMemo(() => {
    const classes = [];
    
    if (beatPulse && isBeatDropped) classes.push('animate-beat-pulse');
    if (isExploding) classes.push('animate-explosion-scatter');
    if (phase >= 5) classes.push('animate-warp');
    if (phase >= 4 && entropy > 80) classes.push('animate-jitter');
    if (sanity < 20) classes.push('animate-shake');
    
    return classes.join(' ');
  }, [phase, entropy, sanity, beatPulse, isExploding]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Background glow effect */}
      <div 
        className={cn(
          "absolute -inset-4 rounded-2xl opacity-40 blur-xl transition-colors duration-1000",
          phase === 1 && "bg-blue-400/20",
          phase === 2 && "bg-orange-400/30",
          phase === 3 && "bg-red-400/30",
          phase === 4 && "bg-purple-400/30",
          phase === 5 && "bg-gradient-to-r from-red-400/40 via-purple-400/40 to-blue-400/40 animate-color-drift"
        )}
      />
      
      {/* Main grid container */}
      <div
        style={gridStyles}
        className={cn(
          "relative grid grid-cols-4 gap-4 p-5 min-w-[280px] w-full",
          "bg-white/50 backdrop-blur-sm rounded-xl border border-blue-300",
          gridAnimationClass
        )}
      >
        {tiles.map((tile) => (
          <GameTile
            key={tile.id}
            tile={tile}
            phase={phase}
            entropy={entropy}
            sanity={sanity}
            onClick={onTileClick}
            beatPulse={beatPulse}
            isExploding={isExploding}
            scatterAmount={scatterAmount}
            isBeatDropped={isBeatDropped}
            isPreDrop={isPreDrop}
          />
        ))}

        {/* Scanline overlay */}
        {phase >= 3 && (
          <div className="absolute inset-0 pointer-events-none scanlines rounded-xl" />
        )}
      </div>
    </div>
  );
});

GameGrid.displayName = 'GameGrid';

export default GameGrid;
