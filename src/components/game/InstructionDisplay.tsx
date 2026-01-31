/**
 * Instruction Display Component
 * Shows the current instruction with chaos effects
 */

import { cn } from '@/lib/utils';
import { GamePhase, TileColor } from '@/types/game';
import { memo, useMemo } from 'react';

interface InstructionDisplayProps {
  instruction: TileColor;
  phase: GamePhase;
  entropy: number;
  sanity: number;
  beatPulse?: boolean;
  isBeatDropped?: boolean;
}

// Glitch text generator
const glitchText = (text: string, intensity: number): string => {
  if (intensity < 0.3) return text;
  
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  return text.split('').map(char => {
    if (Math.random() < intensity * 0.3) {
      return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }
    return char;
  }).join('');
};

const InstructionDisplay = memo(({ instruction, phase, entropy, sanity, beatPulse, isBeatDropped }: InstructionDisplayProps) => {
  // Calculate glitch intensity
  const glitchIntensity = useMemo(() => {
    if (phase < 3) return 0;
    return (entropy / 100) * (1 - sanity / 100);
  }, [phase, entropy, sanity]);

  // Get display text with potential corruption
  const displayText = useMemo(() => {
    const baseText = `Pick ${instruction.toUpperCase()}`;
    
    if (phase >= 5 && glitchIntensity > 0.5) {
      return glitchText(baseText, glitchIntensity);
    }
    
    return baseText;
  }, [instruction, phase, glitchIntensity]);

  // Color class for the instruction
  const colorClass = useMemo(() => ({
    red: 'text-tile-red',
    blue: 'text-tile-blue',
    green: 'text-tile-green',
    yellow: 'text-tile-yellow',
  }[instruction]), [instruction]);

  return (
    <div className={cn(
      "relative",
      beatPulse && isBeatDropped && "animate-beat-pulse"
    )}>
      {/* Background glow */}
      <div className={cn(
        "absolute inset-0 blur-xl opacity-30 rounded-lg",
        phase === 1 && "bg-primary",
        phase === 2 && "bg-secondary",
        phase >= 3 && "bg-destructive"
      )} />

      {/* Main instruction container */}
      <div className={cn(
        "relative hud-panel py-3 lg:py-4 px-6 lg:px-8 text-center",
        phase >= 5 && "animate-jitter",
        isBeatDropped && "neon-glow"
      )}>
        <span className="text-muted-foreground text-sm uppercase tracking-widest">Instruction</span>
        
        <h2 
          className={cn(
            "text-3xl md:text-4xl font-bold mt-2 font-game tracking-wider",
            colorClass,
            phase >= 4 && "neon-text",
            phase >= 5 && "glitch-text animate-flicker",
            isBeatDropped && "animate-neon-intensity"
          )}
          data-text={displayText}
          style={{
            filter: phase >= 3 ? `hue-rotate(${entropy * 0.5}deg)` : undefined,
          }}
        >
          {displayText}
        </h2>

        {/* Reliability indicator */}
        <div className={cn(
          "mt-2 text-xs tracking-wide",
          phase === 1 && "text-success",
          phase === 2 && "text-warning",
          phase >= 3 && "text-destructive"
        )}>
          {phase === 1 && "• RELIABLE •"}
          {phase === 2 && "• UNCERTAIN •"}
          {phase === 3 && "• INVERTED •"}
          {phase === 4 && "• ADAPTIVE •"}
          {phase === 5 && "• C̷O̴R̵R̷U̶P̸T̷ •"}
        </div>
      </div>
    </div>
  );
});

InstructionDisplay.displayName = 'InstructionDisplay';

export default InstructionDisplay;
