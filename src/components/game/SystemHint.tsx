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
    "hud-panel p-4 space-y-3 bg-white border-blue-300",
    phase >= 3 && "border-red-300",
    phase >= 5 && "animate-jitter",
    beatPulse && isBeatDropped && "animate-beat-pulse"
  ), [phase, beatPulse, isBeatDropped]);

  const systemTextClass = useMemo(() => cn(
    "text-sm italic transition-all duration-500",
    phase === 1 && "text-gray-900",
    phase === 2 && "text-gray-900",
    phase === 3 && "text-red-600",
    phase === 4 && "text-orange-600",
    phase === 5 && "text-red-600 animate-pulse"
  ), [phase]);

  const hintTextClass = useMemo(() => cn(
    "text-xs transition-all duration-500",
    phase <= 2 && "text-gray-700",
    phase === 3 && "text-gray-700",
    phase === 4 && "text-blue-700",
    phase >= 5 && "text-red-700"
  ), [phase]);

  return (
    <div className={containerClass}>
      {/* System narration */}
      <div className="border-l-2 border-blue-500 pl-3">
        <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">
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
      <div className="border-l-2 border-blue-400 pl-3">
        <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">
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
        <div className="text-[10px] text-red-600 text-center animate-pulse">
          ⚠ System instability detected ⚠
        </div>
      )}

      {/* Low sanity warning */}
      {sanity < 30 && isPlaying && (
        <div className="text-[10px] text-red-600 text-center animate-flicker">
          ⚠ Reality perception compromised ⚠
        </div>
      )}
    </div>
  );
});

SystemHint.displayName = 'SystemHint';

export default SystemHint;
