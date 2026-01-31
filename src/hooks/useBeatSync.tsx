/**
 * Beat Synchronization Hook
 * Manages beat-synchronized visual effects and theme transitions
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface BeatSyncState {
  currentTime: number;
  isBeatDropped: boolean;
  isPreDrop: boolean;
  isExploding: boolean;
  beatPulse: boolean;
  flashIntensity: number;
  scatterAmount: number;
}

// Beat timings configuration (in seconds)
const BEAT_DROP_TIME = 22;
const PRE_DROP_START = 20.5;
const EXPLOSION_START = 21.5;

export const useBeatSync = (audioRef: React.RefObject<HTMLAudioElement>) => {
  const [syncState, setSyncState] = useState<BeatSyncState>({
    currentTime: 0,
    isBeatDropped: false,
    isPreDrop: false,
    isExploding: false,
    beatPulse: false,
    flashIntensity: 0,
    scatterAmount: 0,
  });

  const animationFrameRef = useRef<number>();
  const lastBeatTimeRef = useRef(0);

  // Sync with audio current time
  const syncWithAudio = useCallback(() => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const isPreDrop = currentTime >= PRE_DROP_START && currentTime < EXPLOSION_START;
    const isExploding = currentTime >= EXPLOSION_START && currentTime < BEAT_DROP_TIME;
    const isBeatDropped = currentTime >= BEAT_DROP_TIME;

    // Calculate flash intensity for beat drop
    let flashIntensity = 0;
    if (currentTime >= BEAT_DROP_TIME && currentTime < BEAT_DROP_TIME + 0.3) {
      // Flash effect at beat drop
      const flashProgress = (currentTime - BEAT_DROP_TIME) / 0.3;
      flashIntensity = 1 - flashProgress;
    }

    // Calculate scatter amount during explosion phase
    let scatterAmount = 0;
    if (isExploding) {
      const explosionProgress = (currentTime - EXPLOSION_START) / (BEAT_DROP_TIME - EXPLOSION_START);
      scatterAmount = Math.sin(explosionProgress * Math.PI) * 100; // Peak scatter in middle
    }

    // Beat pulse detection (on regular beats)
    let beatPulse = false;
    const timeSinceLastBeat = currentTime - lastBeatTimeRef.current;
    if (timeSinceLastBeat >= 0.5) {
      // Trigger beat pulse every ~0.5 seconds (120 BPM)
      beatPulse = true;
      lastBeatTimeRef.current = currentTime;
    }

    setSyncState({
      currentTime,
      isBeatDropped,
      isPreDrop,
      isExploding,
      beatPulse,
      flashIntensity,
      scatterAmount,
    });

    animationFrameRef.current = requestAnimationFrame(syncWithAudio);
  }, [audioRef]);

  // Start syncing when audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      syncWithAudio();
    };

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleEnded = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Reset state when audio ends
      setSyncState({
        currentTime: 0,
        isBeatDropped: false,
        isPreDrop: false,
        isExploding: false,
        beatPulse: false,
        flashIntensity: 0,
        scatterAmount: 0,
      });
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioRef, syncWithAudio]);

  // Reset beat pulse after a short duration
  useEffect(() => {
    if (syncState.beatPulse) {
      const timeout = setTimeout(() => {
        setSyncState(prev => ({ ...prev, beatPulse: false }));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [syncState.beatPulse]);

  return syncState;
};
