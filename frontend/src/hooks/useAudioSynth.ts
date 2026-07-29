import { useState, useCallback, useRef } from 'react';

export function useAudioSynth() {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(
    (freq = 880, durationMs = 100, type: OscillatorType = 'sine') => {
      if (!audioEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
      } catch (err) {
        console.warn('Audio synth error:', err);
      }
    },
    [audioEnabled, getAudioContext]
  );

  const playChime = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  }, [audioEnabled, getAudioContext]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  return {
    audioEnabled,
    toggleAudio,
    playBeep,
    playChime,
  };
}
