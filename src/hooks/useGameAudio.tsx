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
  const bgMusicRef = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode;
    filterNode: BiquadFilterNode;
    distortionNode: WaveShaperNode;
  } | null>(null);
  const currentPhaseRef = useRef<GamePhase>(1);

  // Initialize audio on first user interaction
  const initAudio = useCallback(() => {
    if (isAudioEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    setIsAudioEnabled(true);
  }, [isAudioEnabled]);

  // Create distortion curve for wave shaper
  const createDistortionCurve = useCallback((amount: number): Float32Array<ArrayBuffer> => {
    const samples = 44100;
    const buffer = new ArrayBuffer(samples * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }, []);

  // Play tile click sound with phase-based distortion
  const playTileClick = useCallback((color: TileColor, phase: GamePhase, wasCorrect: boolean) => {
    if (isMuted || !isAudioEnabled) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Main oscillator
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      // Phase-based modifications
      const baseFreq = COLOR_FREQUENCIES[color];
      const detuneAmount = (phase - 1) * 25; // More detune at higher phases
      const distortionAmount = (phase - 1) * 50;

      // Oscillator setup
      osc.type = phase >= 4 ? 'sawtooth' : phase >= 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.detune.setValueAtTime(Math.random() * detuneAmount - detuneAmount / 2, now);

      // Filter for warmth/harshness
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000 - phase * 200, now);
      filterNode.Q.setValueAtTime(phase * 2, now);

      // Gain envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(wasCorrect ? 0.3 : 0.15, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + phase * 0.1);

      // Connect nodes
      osc.connect(filterNode);
      filterNode.connect(gainNode);

      // Add distortion at higher phases
      if (phase >= 3) {
        const distNode = ctx.createWaveShaper();
        distNode.curve = createDistortionCurve(distortionAmount);
        distNode.oversample = '4x';
        gainNode.connect(distNode);
        distNode.connect(ctx.destination);
      } else {
        gainNode.connect(ctx.destination);
      }

      // Additional chaos sounds at high phases
      if (phase >= 4 && Math.random() > 0.5) {
        const noiseOsc = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noiseOsc.type = 'square';
        noiseOsc.frequency.setValueAtTime(baseFreq * (Math.random() * 0.5 + 0.75), now);
        noiseGain.gain.setValueAtTime(0.05, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        noiseOsc.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseOsc.start(now);
        noiseOsc.stop(now + 0.15);
      }

      // Error sound effect
      if (!wasCorrect) {
        const errorOsc = ctx.createOscillator();
        const errorGain = ctx.createGain();
        errorOsc.type = 'square';
        errorOsc.frequency.setValueAtTime(150, now);
        errorOsc.frequency.linearRampToValueAtTime(80, now + 0.15);
        errorGain.gain.setValueAtTime(0.1, now);
        errorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        errorOsc.connect(errorGain);
        errorGain.connect(ctx.destination);
        errorOsc.start(now);
        errorOsc.stop(now + 0.25);
      }

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [isMuted, isAudioEnabled, createDistortionCurve]);

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
      console.warn('Phase transition sound failed:', error);
    }
  }, [isMuted, isAudioEnabled]);

  // Start background music
  const startBackgroundMusic = useCallback(() => {
    if (isMuted || !isAudioEnabled || bgMusicRef.current) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, now);
      masterGain.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.connect(masterGain);

      const distortion = ctx.createWaveShaper();
      distortion.curve = createDistortionCurve(0);
      distortion.connect(filter);

      // Create drone oscillators
      const oscillators: OscillatorNode[] = [];
      const baseFreqs = [55, 82.5, 110]; // A1, E2, A2 - dark ambient drone

      baseFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slow LFO for movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + i * 0.05, now);
        lfoGain.gain.setValueAtTime(2, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, now);
        osc.connect(oscGain);
        oscGain.connect(distortion);
        osc.start(now);
        oscillators.push(osc);
      });

      bgMusicRef.current = {
        oscillators,
        gainNode: masterGain,
        filterNode: filter,
        distortionNode: distortion,
      };
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }, [isMuted, isAudioEnabled, createDistortionCurve]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (bgMusicRef.current) {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      bgMusicRef.current.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      bgMusicRef.current.oscillators.forEach((osc) => {
        try {
          osc.stop(now + 0.6);
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      bgMusicRef.current = null;
    }
  }, []);

  // Update background music based on phase
  const updateMusicForPhase = useCallback((phase: GamePhase, entropy: number, sanity: number) => {
    if (!bgMusicRef.current || isMuted) return;
    currentPhaseRef.current = phase;

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const { filterNode, distortionNode, gainNode } = bgMusicRef.current;

    // Modulate filter based on chaos
    const chaosLevel = (entropy + (100 - sanity)) / 200;
    const filterFreq = 300 + chaosLevel * 1500 + phase * 200;
    filterNode.frequency.linearRampToValueAtTime(filterFreq, now + 0.1);
    filterNode.Q.linearRampToValueAtTime(phase * 3, now + 0.1);

    // Increase distortion with phase
    distortionNode.curve = createDistortionCurve(phase * 100);

    // Volume dynamics
    const volume = 0.06 + phase * 0.02 + chaosLevel * 0.04;
    gainNode.gain.linearRampToValueAtTime(Math.min(volume, 0.2), now + 0.1);
  }, [isMuted, createDistortionCurve]);

  // Play game over sound
  const playGameOver = useCallback((won: boolean) => {
    if (isMuted || !isAudioEnabled) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (won) {
        // Victory arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          gain.gain.setValueAtTime(0, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.6);
        });
      } else {
        // Defeat descending
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 1.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 1.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.6);
      }
    } catch (error) {
      console.warn('Game over sound failed:', error);
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
    startBackgroundMusic,
    stopBackgroundMusic,
    updateMusicForPhase,
  };
};
