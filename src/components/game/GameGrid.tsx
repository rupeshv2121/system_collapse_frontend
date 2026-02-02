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
  beatIntensity?: number;
  gridShake?: number;
  glowIntensity?: number;
  isExploding?: boolean;
  scatterAmount?: number;
  isBeatDropped?: boolean;
  isPreDrop?: boolean;
  isCollapsing?: boolean;
  isResetting?: boolean;
}

const GameGrid = memo(({ tiles, phase, entropy, sanity, onTileClick, beatPulse, beatIntensity = 0, gridShake = 0, glowIntensity = 0, isExploding, scatterAmount, isBeatDropped, isPreDrop, isCollapsing, isResetting }: GameGridProps) => {
  const phaseConfig = PHASE_CONFIGS[phase];

  // Grid chaos effects
  const gridStyles = useMemo(() => {
    const chaosLevel = (100 - sanity + entropy) / 200;
    const blur = phaseConfig.visualEffects.blur * chaosLevel;
    const hueShift = phaseConfig.visualEffects.hueShift * chaosLevel;
    
    const styles: React.CSSProperties = {
      filter: `blur(${blur}px) hue-rotate(${hueShift}deg)`,
      opacity: phaseConfig.visualEffects.opacity,
      transform: undefined,
    };

    // Add scatter variables for explosion effect
    if (isExploding && scatterAmount) {
      const angle = Math.random() * Math.PI * 2;
      const distance = scatterAmount * 0.5; // Grid moves less than tiles
      (styles as any)['--scatter-x'] = `${Math.cos(angle) * distance}px`;
      (styles as any)['--scatter-y'] = `${Math.sin(angle) * distance}px`;
      (styles as any)['--scatter-rotate'] = `${(Math.random() - 0.5) * 15}deg`;
    }
    
    return styles;
  }, [phase, entropy, sanity, phaseConfig, gridShake, isExploding, scatterAmount]);

  const gridAnimationClass = useMemo(() => {
    if (isResetting) return '';
    const classes = [];
    
    if (isCollapsing) classes.push('animate-vibrate-intense');
    else {
      if (beatPulse && beatIntensity > 0) classes.push('animate-beat-pulse');
      if (isExploding) classes.push('animate-explosion-scatter');
      if (phase >= 5) classes.push('animate-warp');
      if (phase >= 4 && entropy > 80) classes.push('animate-jitter');
      if (sanity < 20) classes.push('animate-shake');
    }
    
    return classes.join(' ');
  }, [phase, entropy, sanity, beatPulse, beatIntensity, isExploding, isCollapsing, isResetting]);

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
        style={{
          opacity: Math.max(0.4, 0.4 + glowIntensity * 0.6),
          transform: glowIntensity > 0 ? `scale(${1 + glowIntensity * 0.1})` : undefined,
          boxShadow: glowIntensity > 0 ? `0 0 ${20 + glowIntensity * 30}px rgb(255, 0, 255, ${glowIntensity * 0.4}), 0 0 ${40 + glowIntensity * 50}px rgb(0, 255, 255, ${glowIntensity * 0.2})` : undefined,
        }}
      />
      
      {/* Main grid container */}
      <div
        style={gridStyles}
        className={cn(
          "relative grid grid-cols-4 gap-4 p-5 min-w-[280px] w-full",
          "bg-white/50 backdrop-blur-sm rounded-xl border border-blue-300",
          gridAnimationClass,
          isResetting && "transition-none"
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
            beatIntensity={beatIntensity}
            gridShake={gridShake}
            isExploding={isExploding}
            scatterAmount={scatterAmount}
            isBeatDropped={isBeatDropped}
            isPreDrop={isPreDrop}
            isResetting={isResetting}
          />
        ))}

        {/* Scanline overlay */}
        {phase >= 3 && (
          <div className="absolute inset-0 pointer-events-none scanlines rounded-xl" />
        )}

        {/* Collapse overlay */}
        {isCollapsing && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-orange-500/60 to-yellow-500/60 rounded-xl pointer-events-none animate-pulse" />
        )}
      </div>
    </div>
  );
});

GameGrid.displayName = 'GameGrid';

export default GameGrid;
