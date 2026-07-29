import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAudioSynth } from '../hooks/useAudioSynth';

interface RestTimerContextType {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: number | boolean;
  exerciseName: string;
  progressPercent: number;
  audioEnabled: boolean;
  toggleAudio: () => void;
  startTimer: (seconds: number, name?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  addSeconds: (delta: number) => void;
  skipTimer: () => void;
  playBeep: (freq?: number, durationMs?: number) => void;
}

const RestTimerContext = createContext<RestTimerContextType | null>(null);

const STORAGE_KEY = 'bws_rest_timer_state_v2';

interface StoredTimerState {
  targetEndTime: number; // Date.now() timestamp when timer reaches 0
  totalSeconds: number;
  pausedRemainingSeconds: number | null;
  exerciseName: string;
}

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { audioEnabled, toggleAudio, playBeep, playChime } = useAudioSynth();

  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [pausedRemainingSeconds, setPausedRemainingSeconds] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const prevSecondsRef = useRef<number>(0);

  // Restore timer state on mount/load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredTimerState = JSON.parse(raw);
        if (parsed.pausedRemainingSeconds !== null) {
          setPausedRemainingSeconds(parsed.pausedRemainingSeconds);
          setTotalSeconds(parsed.totalSeconds);
          setExerciseName(parsed.exerciseName);
          setSecondsRemaining(parsed.pausedRemainingSeconds);
        } else if (parsed.targetEndTime > Date.now()) {
          setTargetEndTime(parsed.targetEndTime);
          setTotalSeconds(parsed.totalSeconds);
          setExerciseName(parsed.exerciseName);
        }
      }
    } catch (e) {
      console.warn('Timer storage parse note:', e);
    }
  }, []);

  // Save timer state on changes
  useEffect(() => {
    try {
      if (pausedRemainingSeconds !== null) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            targetEndTime: 0,
            totalSeconds,
            pausedRemainingSeconds,
            exerciseName,
          })
        );
      } else if (targetEndTime && targetEndTime > Date.now()) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            targetEndTime,
            totalSeconds,
            pausedRemainingSeconds: null,
            exerciseName,
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Timer save note:', e);
    }
  }, [targetEndTime, totalSeconds, pausedRemainingSeconds, exerciseName]);

  // Main 100ms ticker for accurate background calculation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (pausedRemainingSeconds !== null) {
      setSecondsRemaining(pausedRemainingSeconds);
    } else if (targetEndTime) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        setSecondsRemaining(remaining);

        // Sound cues
        if (remaining > 0 && remaining !== prevSecondsRef.current) {
          if (remaining <= 3) {
            playBeep(880, 120);
          }
        }

        if (remaining === 0) {
          playChime();
          setTargetEndTime(null);
          setTotalSeconds(0);
          setExerciseName('');
          localStorage.removeItem(STORAGE_KEY);
        }

        prevSecondsRef.current = remaining;
      }, 250);
    } else {
      setSecondsRemaining(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [targetEndTime, pausedRemainingSeconds, playBeep, playChime]);

  const startTimer = useCallback((seconds: number, name = 'Rest Timer') => {
    const end = Date.now() + seconds * 1000;
    setTotalSeconds(seconds);
    setExerciseName(name);
    setPausedRemainingSeconds(null);
    setTargetEndTime(end);
    setSecondsRemaining(seconds);
    prevSecondsRef.current = seconds;
  }, []);

  const pauseTimer = useCallback(() => {
    if (targetEndTime && targetEndTime > Date.now()) {
      const remaining = Math.max(1, Math.ceil((targetEndTime - Date.now()) / 1000));
      setPausedRemainingSeconds(remaining);
      setTargetEndTime(null);
    }
  }, [targetEndTime]);

  const resumeTimer = useCallback(() => {
    if (pausedRemainingSeconds && pausedRemainingSeconds > 0) {
      const end = Date.now() + pausedRemainingSeconds * 1000;
      setTargetEndTime(end);
      setPausedRemainingSeconds(null);
    }
  }, [pausedRemainingSeconds]);

  const addSeconds = useCallback((delta: number) => {
    if (pausedRemainingSeconds !== null) {
      const next = Math.max(1, pausedRemainingSeconds + delta);
      setPausedRemainingSeconds(next);
      setSecondsRemaining(next);
    } else if (targetEndTime) {
      const remaining = Math.max(1, Math.ceil((targetEndTime - Date.now()) / 1000) + delta);
      const end = Date.now() + remaining * 1000;
      setTargetEndTime(end);
      setSecondsRemaining(remaining);
    }
    setTotalSeconds((prev) => Math.max(1, prev + delta));
  }, [pausedRemainingSeconds, targetEndTime]);

  const skipTimer = useCallback(() => {
    setTargetEndTime(null);
    setPausedRemainingSeconds(null);
    setTotalSeconds(0);
    setSecondsRemaining(0);
    setExerciseName('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isRunning = (targetEndTime !== null && targetEndTime > Date.now()) || pausedRemainingSeconds !== null;
  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100) : 0;

  return (
    <RestTimerContext.Provider
      value={{
        secondsRemaining,
        totalSeconds,
        isRunning,
        exerciseName,
        progressPercent,
        audioEnabled,
        toggleAudio,
        startTimer,
        pauseTimer,
        resumeTimer,
        addSeconds,
        skipTimer,
        playBeep,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
};

export const useRestTimerContext = () => {
  const ctx = useContext(RestTimerContext);
  if (!ctx) {
    throw new Error('useRestTimerContext must be used within a RestTimerProvider');
  }
  return ctx;
};
