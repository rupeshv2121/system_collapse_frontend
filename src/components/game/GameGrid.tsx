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
}

const GameGrid = memo(({ tiles, phase, entropy, sanity, onTileClick }: GameGridProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];

  // Grid chaos effects
  const gridStyles = useMemo(() => {
    const chaosLevel = (100 - sanity + entropy) / 200;
    const blur = phaseConfig.visualEffects.blur * chaosLevel;
    const hueShift = phaseConfig.visualEffects.hueShift * chaosLevel;
    
    return {
      filter: `blur(${blur}px) hue-rotate(${hueShift}deg)`,
      opacity: phaseConfig.visualEffects.opacity,
    } as React.CSSProperties;
  }, [phase, entropy, sanity, phaseConfig]);

  const gridAnimationClass = useMemo(() => {
    if (phase >= 5) return 'animate-warp';
    if (phase >= 4 && entropy > 80) return 'animate-jitter';
    if (sanity < 20) return 'animate-shake';
    return '';
  }, [phase, entropy, sanity]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Background glow effect */}
      <div 
        className={cn(
          "absolute -inset-4 rounded-2xl opacity-50 blur-xl transition-colors duration-1000",
          phase === 1 && "bg-primary/20",
          phase === 2 && "bg-secondary/30",
          phase === 3 && "bg-destructive/30",
          phase === 4 && "bg-accent/30",
          phase === 5 && "bg-gradient-to-r from-destructive/40 via-secondary/40 to-primary/40 animate-color-drift"
        )}
      />
      
      {/* Main grid container */}
      <div
        style={gridStyles}
        className={cn(
          "relative grid grid-cols-4 gap-4 p-5 min-w-[280px] w-full",
          "bg-card/50 backdrop-blur-sm rounded-xl border border-border",
          "neon-glow",
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
