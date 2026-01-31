/**
 * System Hint Panel Component
 * Displays evolving hints and system narration
 */

import { getHintMessage, getSystemMessage } from '@/data/systemMessages';
import { cn } from '@/lib/utils';
import { GamePhase } from '@/types/game';
import { memo, useEffect, useMemo, useState } from 'react';

interface SystemHintProps {
  phase: GamePhase;
  sanity: number;
  entropy: number;
  isPlaying: boolean;
  beatPulse?: boolean;
  isBeatDropped?: boolean;
}

const SystemHint = memo(({ phase, sanity, entropy, isPlaying, beatPulse, isBeatDropped }: SystemHintProps) => {
  const [systemMessage, setSystemMessage] = useState('');
  const [hintMessage, setHintMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  // Update messages periodically and on phase change
  useEffect(() => {
    if (!isPlaying) {
      setSystemMessage('Awaiting initialization...');
      setHintMessage('Press START to begin.');
      return;
    }

    const updateMessages = () => {
      setSystemMessage(getSystemMessage(phase, sanity));
      setHintMessage(getHintMessage(phase));
      setMessageKey(k => k + 1);
    };

    updateMessages();

    // Update messages every few seconds
    const interval = setInterval(updateMessages, 5000 - (phase * 500));
    return () => clearInterval(interval);
  }, [phase, sanity, isPlaying]);

  // Visual effects based on phase
  const containerClass = useMemo(() => cn(
    "hud-panel p-4 space-y-3",
    phase >= 3 && "border-destructive/50",
    phase >= 5 && "animate-jitter",
    beatPulse && isBeatDropped && "animate-beat-pulse"
  ), [phase, beatPulse, isBeatDropped]);

  const systemTextClass = useMemo(() => cn(
    "text-sm italic transition-all duration-500",
    phase === 1 && "text-foreground",
    phase === 2 && "text-foreground",
    phase === 3 && "text-destructive",
    phase === 4 && "text-accent",
    phase === 5 && "text-destructive animate-pulse neon-text-secondary"
  ), [phase]);

  const hintTextClass = useMemo(() => cn(
    "text-xs transition-all duration-500",
    phase <= 2 && "text-foreground/80",
    phase === 3 && "text-foreground/80",
    phase === 4 && "text-secondary",
    phase >= 5 && "text-destructive/70"
  ), [phase]);

  return (
    <div className={containerClass}>
      {/* System narration */}
      <div className="border-l-2 border-primary pl-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          System Narration
        </div>
        <p 
          key={`sys-${messageKey}`}
          className={cn(systemTextClass, "animate-fade-in")}
          style={{
            filter: sanity < 30 ? `blur(${(30 - sanity) / 30}px)` : undefined
          }}
        >
          "{systemMessage}"
        </p>
      </div>

      {/* Hint section */}
      <div className="border-l-2 border-secondary pl-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          System Hint
        </div>
        <p 
          key={`hint-${messageKey}`}
          className={cn(hintTextClass, "animate-fade-in")}
        >
          {hintMessage}
        </p>
      </div>

      {/* Entropy warning */}
      {entropy > 70 && (
        <div className="text-[10px] text-destructive text-center animate-pulse">
          ⚠ System instability detected ⚠
        </div>
      )}

      {/* Low sanity warning */}
      {sanity < 30 && isPlaying && (
        <div className="text-[10px] text-destructive text-center animate-flicker">
          ⚠ Reality perception compromised ⚠
        </div>
      )}
    </div>
  );
});

SystemHint.displayName = 'SystemHint';

export default SystemHint;
