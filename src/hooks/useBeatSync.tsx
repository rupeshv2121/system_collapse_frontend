import { useCallback, useEffect, useRef, useState } from 'react';

interface BeatSyncState {
  currentTime: number;
  isBeatDropped: boolean;
  isPreDrop: boolean;
  isExploding: boolean;
  beatPulse: boolean;
  flashIntensity: number;
  scatterAmount: number;
  beatIntensity: number;
  gridShake: number;
  glowIntensity: number;
}

// Beat detection configuration
const BEAT_INTERVAL = 0.5; // Detect beats every ~0.5 seconds (120 BPM)
const BEAT_SENSITIVITY = 0.15; // How long a beat effect lasts

export const useBeatSync = (audioRef: React.RefObject<HTMLAudioElement>) => {
  const [syncState, setSyncState] = useState<BeatSyncState>({
    currentTime: 0,
    isBeatDropped: false,
    isPreDrop: false,
    isExploding: false,
    beatPulse: false,
    flashIntensity: 0,
    scatterAmount: 0,
    beatIntensity: 0,
    gridShake: 0,
    glowIntensity: 0,
  });

  const animationFrameRef = useRef<number>();
  const lastBeatTimeRef = useRef(0);
  const beatStartTimeRef = useRef(0);

  // Sync with audio and detect beats
  const syncWithAudio = useCallback(() => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const timeSinceLastBeat = currentTime - lastBeatTimeRef.current;

    // Beat detection
    let beatPulse = false;
    let beatIntensity = 0;

    if (timeSinceLastBeat >= BEAT_INTERVAL) {
      // New beat detected
      beatPulse = true;
      beatIntensity = 1;
      lastBeatTimeRef.current = currentTime;
      beatStartTimeRef.current = currentTime;
    }

    // Calculate beat intensity decay
    const timeSinceBeatStart = currentTime - beatStartTimeRef.current;
    if (timeSinceBeatStart < BEAT_SENSITIVITY) {
      beatIntensity = Math.max(0, 1 - timeSinceBeatStart / BEAT_SENSITIVITY);
    } else {
      beatIntensity = 0;
      beatPulse = false;
    }

    // Grid shake and glow intensity follow beat
    const gridShake = beatIntensity * 8; // 0-8px shake
    const glowIntensity = beatIntensity;
    const flashIntensity = beatIntensity * 0.3;

    setSyncState({
      currentTime,
      isBeatDropped: false,
      isPreDrop: false,
      isExploding: false,
      beatPulse,
      flashIntensity,
      scatterAmount: 0,
      beatIntensity,
      gridShake,
      glowIntensity,
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
        beatIntensity: 0,
        gridShake: 0,
        glowIntensity: 0,
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
