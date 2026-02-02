/**
 * Game Audio System with Phase-Based Distortion
 * Uses Web Audio API for synthesized sounds that evolve with chaos
 */

import { GamePhase, TileColor } from '@/types/game';
import { useCallback, useEffect, useRef, useState } from 'react';

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Color to frequency mapping (pentatonic scale for pleasant sounds)
const COLOR_FREQUENCIES: Record<TileColor, number> = {
  red: 440,    // A4
  blue: 523,   // C5
  green: 587,  // D5
  yellow: 659, // E5
};

export const useGameAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const currentPhaseRef = useRef<GamePhase>(1);
  const tileClickAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameEndAudioRef = useRef<HTMLAudioElement | null>(null);
  const phaseCycleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on first user interaction
  const initAudio = useCallback(() => {
    if (isAudioEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    setIsAudioEnabled(true);
  }, [isAudioEnabled]);

  // Initialize tile click audio element
  useEffect(() => {
    if (!tileClickAudioRef.current) {
      const audio = new Audio('/audio/tile_click.wav');
      audio.preload = 'auto';
      tileClickAudioRef.current = audio;
    }

    if (!gameEndAudioRef.current) {
      const audio = new Audio('/audio/game_end.wav');
      audio.preload = 'auto';
      gameEndAudioRef.current = audio;
    }

    if (!phaseCycleAudioRef.current) {
      const audio = new Audio('/audio/Phase_cycle_change.wav');
      audio.preload = 'auto';
      phaseCycleAudioRef.current = audio;
    }
  }, []);

  // Play tile click sound from audio file
  const playTileClick = useCallback((color: TileColor, phase: GamePhase, wasCorrect: boolean) => {
    if (isMuted || !isAudioEnabled || !tileClickAudioRef.current) return;

    try {
      const audio = tileClickAudioRef.current;
      audio.currentTime = 0;
      
      // Adjust volume based on phase and correctness
      const baseVolume = wasCorrect ? 0.8 : 0.5;
      const phaseVolume = Math.min(baseVolume * (1 + (phase - 1) * 0.1), 1);
      audio.volume = phaseVolume;
      
      audio.play().catch(err => {});
    } catch (error) {
    }
  }, [isMuted, isAudioEnabled]);

  // Play phase transition sound
  const playPhaseTransition = useCallback((newPhase: GamePhase) => {
    if (isMuted || !isAudioEnabled) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Rising sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(400 + newPhase * 100, now + 0.5);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.linearRampToValueAtTime(2000, now + 0.5);
      filter.Q.setValueAtTime(5, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);

      // Descending impact
      const impactOsc = ctx.createOscillator();
      const impactGain = ctx.createGain();
      impactOsc.type = 'sine';
      impactOsc.frequency.setValueAtTime(150 + newPhase * 30, now + 0.5);
      impactOsc.frequency.exponentialRampToValueAtTime(50, now + 1);
      impactGain.gain.setValueAtTime(0.3, now + 0.5);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      impactOsc.connect(impactGain);
      impactGain.connect(ctx.destination);
      impactOsc.start(now + 0.5);
      impactOsc.stop(now + 1.3);
    } catch (error) {
    }
  }, [isMuted, isAudioEnabled]);

  // Start background music
  const startBackgroundMusic = useCallback(() => {
    // Background music is now handled by audio element in GameScreen
    // This function is kept for compatibility but does nothing
  }, []);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    // Background music is now handled by audio element in GameScreen
    // This function is kept for compatibility but does nothing
  }, []);

  // Update background music based on phase
  const updateMusicForPhase = useCallback((phase: GamePhase, _entropy: number, _sanity: number) => {
    // Background music is now handled by audio element in GameScreen
    // This function is kept for compatibility but does nothing
    currentPhaseRef.current = phase;
  }, []);

  // Play game over sound
  const playGameOver = useCallback((_won: boolean) => {
    if (isMuted || !isAudioEnabled || !gameEndAudioRef.current) return;

    try {
      const audio = gameEndAudioRef.current;
      audio.currentTime = 0;
      audio.volume = 1;
      audio.play().catch(err => {});
    } catch (error) {
    }
  }, [isMuted, isAudioEnabled]);

  // Play phase cycle completion sound
  const playPhaseCycleChange = useCallback(() => {
    if (isMuted || !isAudioEnabled || !phaseCycleAudioRef.current) return;

    try {
      const audio = phaseCycleAudioRef.current;
      audio.currentTime = 0;
      audio.volume = 1;
      audio.play().catch(err => {});
    } catch (error) {
    }
  }, [isMuted, isAudioEnabled]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  return {
    isMuted,
    isAudioEnabled,
    initAudio,
    toggleMute,
    playTileClick,
    playPhaseTransition,
    playGameOver,
    playPhaseCycleChange,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateMusicForPhase,
  };
};
