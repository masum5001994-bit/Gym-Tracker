import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Check,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Clock,
  Dumbbell,
  ArrowLeft,
  Flame,
  Trophy,
  Save,
  Info,
  Timer,
  ChevronDown,
  ChevronUp,
  Edit3,
  FastForward,
} from 'lucide-react';

import { Routine, LiveExerciseLog, LiveSetLog, Exercise } from '../types';
import { api } from '../services/api';
import { useRestTimer } from '../hooks/useRestTimer';
import { useAuthContext } from '../context/AuthContext';
import { RestTimerWidget } from '../components/RestTimerWidget';
import { saveCustomExerciseName } from '../utils/exerciseRenamer';
import { getCustomCycleDays } from '../utils/cycleCustomizer';
import { markDayCompleted } from '../utils/cycleCompletion';
import { PlateCalculatorModal } from '../components/PlateCalculatorModal';
import { Disc } from 'lucide-react';


import { triggerHaptic } from '../utils/haptics';

import { DeltaBadge } from '../components/DeltaBadge';
import { ExerciseSwapModal } from '../components/ExerciseSwapModal';
import { ExerciseImage } from '../components/ExerciseImage';

export const LiveWorkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<LiveExerciseLog[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Exercise Accordion Collapse State (all collapsed by default: true = collapsed, false = expanded)
  const [collapsedMap, setCollapsedMap] = useState<Record<number, boolean>>({});

  const toggleCollapse = (exIdx: number) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [exIdx]: prev[exIdx] === false ? true : false,
    }));
  };

  const expandAllExercises = () => {
    const newMap: Record<number, boolean> = {};
    exerciseLogs.forEach((_, idx) => (newMap[idx] = false));
    setCollapsedMap(newMap);
  };

  const collapseAllExercises = () => {
    const newMap: Record<number, boolean> = {};
    exerciseLogs.forEach((_, idx) => (newMap[idx] = true));
    setCollapsedMap(newMap);
  };


  // Exercise Renaming State
  const [renamingExIdx, setRenamingExIdx] = useState<number | null>(null);
  const [newExNameInput, setNewExNameInput] = useState<string>('');

  const handleStartRenameExercise = (exIdx: number, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setRenamingExIdx(exIdx);
    setNewExNameInput(currentName);
  };

  const handleSaveExerciseRename = (exIdx: number, originalName: string, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newExNameInput.trim()) return;

    triggerHaptic('success');
    const updatedName = newExNameInput.trim();
    saveCustomExerciseName(originalName, updatedName);

    setExerciseLogs((prev) =>
      prev.map((log, idx) => (idx === exIdx ? { ...log, exerciseName: updatedName } : log))
    );
    setRenamingExIdx(null);
  };

  // Exercise Swap State
  const [swapModalOpen, setSwapModalOpen] = useState<boolean>(false);
  const [swapTargetIndex, setSwapTargetIndex] = useState<number | null>(null);

  // Plate Calculator Modal State
  const [plateModalOpen, setPlateModalOpen] = useState<boolean>(false);
  const [targetCalcWeight, setTargetCalcWeight] = useState<number>(100);

  // Skipped Exercises State
  const [skippedMap, setSkippedMap] = useState<Record<number, boolean>>({});



  // Summary Celebration Modal
  const [summaryData, setSummaryData] = useState<{
    totalVolumeKg: number;
    prCount: number;
    durationMinutes: number;
    logId: string;
  } | null>(null);



  // Rest Timer Hook
  const restTimer = useRestTimer();

  const SESSION_KEY = `bws_active_session_${id}`;

  // Load routine & restore persistent active session
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([api.getRoutineById(id), api.getWorkouts(user?.uid)])
      .then(([data, workouts]) => {
        setRoutine(data);

        // Helper to find previous sets for an exercise from workout history
        const findPrevSets = (exerciseId: string): LiveSetLog[] => {
          for (const w of workouts) {
            const ex = w.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
            if (ex && ex.sets && ex.sets.length > 0) {
              return ex.sets;
            }
          }
          return [];
        };

        // Check for active saved session (only if it matches full exercise count)
        try {
          const raw = localStorage.getItem(SESSION_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            if (
              saved &&
              Array.isArray(saved.exerciseLogs) &&
              data.exercises &&
              saved.exerciseLogs.length >= data.exercises.length
            ) {
              setExerciseLogs(saved.exerciseLogs);
              setIsTimerRunning(Boolean(saved.isTimerRunning));

              if (saved.isTimerRunning && saved.startTimeTimestamp) {
                const elapsed = Math.max(0, Math.floor((Date.now() - saved.startTimeTimestamp) / 1000));
                setElapsedSeconds(elapsed);
              } else {
                setElapsedSeconds(saved.pausedElapsedSeconds || 0);
              }
              return;
            } else {
              localStorage.removeItem(SESSION_KEY);
            }
          }
        } catch (e) {
          console.warn('Session restore note:', e);
        }

        // Initialize fresh logs with PREVIOUS LOAD WEIGHT pre-filled
        if (data.exercises) {
          const initialLogs: LiveExerciseLog[] = data.exercises.map((ex) => {
            const defaultSetCount = ex.defaultSets || 3;
            const prevSets = ex.previousSets && ex.previousSets.length > 0 ? ex.previousSets : findPrevSets(ex.id);
            const maxPrevWeight = prevSets.length > 0 ? Math.max(...prevSets.map((s) => s.weightKg || 0)) : 0;

            const sets: LiveSetLog[] = Array.from({ length: defaultSetCount }).map((_, idx) => {
              const prev = prevSets[idx];
              const prefilledWeight = prev && prev.weightKg > 0 ? prev.weightKg : maxPrevWeight;

              return {
                setNum: idx + 1,
                weightKg: prefilledWeight,
                reps: prev ? prev.reps : ex.minReps || 8,
                completed: false,
              };
            });

            return {
              exerciseId: ex.id,
              exerciseName: ex.name,
              category: ex.category,
              restSeconds: ex.restSeconds || 120,
              notes: ex.notes,
              alternatives: ex.alternatives || [],
              sets,
              previousSets: prevSets,
            };
          });
          setExerciseLogs(initialLogs);
          setElapsedSeconds(0);
          setIsTimerRunning(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching routine:', err);
      })
      .finally(() => setLoading(false));
  }, [id, user]);


  // Persist session state on updates
  useEffect(() => {
    if (!id || exerciseLogs.length === 0) return;
    try {
      const startTimeTimestamp = isTimerRunning ? Date.now() - elapsedSeconds * 1000 : null;
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          routineId: id,
          startTimeTimestamp,
          pausedElapsedSeconds: elapsedSeconds,
          isTimerRunning,
          exerciseLogs,
        })
      );
    } catch (e) {
      console.warn('Session save note:', e);
    }
  }, [id, elapsedSeconds, isTimerRunning, exerciseLogs]);

  // Controlled Workout Duration Timer with Background Persistence (Timestamp-based)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let startTimeMs = Date.now() - elapsedSeconds * 1000;

    const updateTimer = () => {
      if (isTimerRunning) {
        const currentElapsed = Math.max(0, Math.floor((Date.now() - startTimeMs) / 1000));
        setElapsedSeconds(currentElapsed);
      }
    };

    if (isTimerRunning) {
      interval = setInterval(updateTimer, 500);
      document.addEventListener('visibilitychange', updateTimer);
      window.addEventListener('focus', updateTimer);
    }

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', updateTimer);
      window.removeEventListener('focus', updateTimer);
    };
  }, [isTimerRunning]);


  const toggleWorkoutTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const resetWorkoutSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    if (routine && routine.exercises) {
      const freshLogs: LiveExerciseLog[] = routine.exercises.map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: ex.category,
        restSeconds: ex.restSeconds || 120,
        notes: ex.notes,
        alternatives: ex.alternatives || [],
        sets: Array.from({ length: ex.defaultSets || 3 }).map((_, idx) => ({
          setNum: idx + 1,
          weightKg: ex.previousSets?.[idx]?.weightKg || 0,
          reps: ex.previousSets?.[idx]?.reps || 8,
          completed: false,
        })),
        previousSets: ex.previousSets || [],
      }));
      setExerciseLogs(freshLogs);
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle set completion and trigger rest timer
  const handleToggleSet = (exIndex: number, setIndex: number) => {
    const updated = [...exerciseLogs];
    const targetSet = updated[exIndex].sets[setIndex];
    const isNowCompleted = !targetSet.completed;
    targetSet.completed = isNowCompleted;

    setExerciseLogs(updated);
    if (routine) {
      api.syncSetToDatabase(routine.id, updated, user?.uid);
    }

    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
  };


  const handleUpdateSet = (
    exIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    val: number
  ) => {
    const updated = [...exerciseLogs];
    const newVal = Math.max(0, val);
    updated[exIndex].sets[setIndex][field] = newVal;

    // Smart Auto-Sync: If modifying Set 1 (setIndex === 0), auto-sync to all subsequent UNCOMPLETED sets!
    if (setIndex === 0) {
      for (let i = 1; i < updated[exIndex].sets.length; i++) {
        if (!updated[exIndex].sets[i].completed) {
          updated[exIndex].sets[i][field] = newVal;
        }
      }
    }

    setExerciseLogs(updated);
  };

  const handleAdjustWeight = (exIndex: number, setIndex: number, deltaKg: number) => {
    triggerHaptic('light');
    const updated = [...exerciseLogs];
    const current = updated[exIndex].sets[setIndex].weightKg;
    const nextWeight = Math.max(0, Math.round((current + deltaKg) * 10) / 10);
    updated[exIndex].sets[setIndex].weightKg = nextWeight;

    // Smart Auto-Sync: If modifying Set 1 (setIndex === 0), auto-sync to all subsequent UNCOMPLETED sets!
    if (setIndex === 0) {
      for (let i = 1; i < updated[exIndex].sets.length; i++) {
        if (!updated[exIndex].sets[i].completed) {
          updated[exIndex].sets[i].weightKg = nextWeight;
        }
      }
    }

    setExerciseLogs(updated);
  };

  const handleAdjustReps = (exIndex: number, setIndex: number, deltaReps: number) => {
    triggerHaptic('light');
    const updated = [...exerciseLogs];
    const current = updated[exIndex].sets[setIndex].reps;
    const nextReps = Math.max(1, current + deltaReps);
    updated[exIndex].sets[setIndex].reps = nextReps;

    // Smart Auto-Sync: If modifying Set 1 (setIndex === 0), auto-sync reps to subsequent UNCOMPLETED sets!
    if (setIndex === 0) {
      for (let i = 1; i < updated[exIndex].sets.length; i++) {
        if (!updated[exIndex].sets[i].completed) {
          updated[exIndex].sets[i].reps = nextReps;
        }
      }
    }

    setExerciseLogs(updated);
  };


  const handleUpdateEffort = (exIndex: number, setIndex: number, effort: string) => {
    triggerHaptic('light');
    const updated = [...exerciseLogs];
    updated[exIndex].sets[setIndex].effort =
      updated[exIndex].sets[setIndex].effort === effort ? undefined : effort;
    setExerciseLogs(updated);
  };

  const handleAddSet = (exIndex: number) => {
    triggerHaptic('medium');
    const updated = [...exerciseLogs];
    const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
    const newSetNum = updated[exIndex].sets.length + 1;

    updated[exIndex].sets.push({
      setNum: newSetNum,
      weightKg: lastSet ? lastSet.weightKg : 0,
      reps: lastSet ? lastSet.reps : 8,
      completed: false,
    });
    setExerciseLogs(updated);
  };

  const handleDeleteSet = (exIndex: number, setIndex: number) => {

    const updated = [...exerciseLogs];
    if (updated[exIndex].sets.length <= 1) return;
    updated[exIndex].sets.splice(setIndex, 1);
    updated[exIndex].sets = updated[exIndex].sets.map((s, idx) => ({ ...s, setNum: idx + 1 }));
    setExerciseLogs(updated);
  };

  // Exercise Swap logic
  const handleSwapExercise = (selectedExercise: Exercise) => {
    if (swapTargetIndex === null) return;
    const updated = [...exerciseLogs];

    updated[swapTargetIndex] = {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      category: selectedExercise.category,
      restSeconds: selectedExercise.restSeconds,
      notes: selectedExercise.notes,
      alternatives: selectedExercise.alternatives,
      sets: Array.from({ length: selectedExercise.defaultSets || 3 }).map((_, idx) => ({
        setNum: idx + 1,
        weightKg: 0,
        reps: selectedExercise.minReps || 8,
        completed: false,
      })),
      previousSets: selectedExercise.previousSets || [],
    };

    setExerciseLogs(updated);
  };

  const handleDoneWithExercise = (exIdx: number) => {
    triggerHaptic('success');
    const newMap = { ...collapsedMap };
    newMap[exIdx] = true;

    const nextIdx = exIdx + 1;
    if (nextIdx < exerciseLogs.length) {
      newMap[nextIdx] = false;
      setCollapsedMap(newMap);

      setTimeout(() => {
        const nextEl = document.getElementById(`exercise-card-${nextIdx}`);
        if (nextEl) {
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setCollapsedMap(newMap);
    }
  };

  const handleSkipExercise = (exIdx: number) => {
    triggerHaptic('light');
    const newSkipped = { ...skippedMap, [exIdx]: true };
    setSkippedMap(newSkipped);

    // Collapse current exercise
    const newCollapsed = { ...collapsedMap, [exIdx]: true };

    // Auto open next exercise if available
    const nextIdx = exIdx + 1;
    if (nextIdx < exerciseLogs.length) {
      newCollapsed[nextIdx] = false;
      setCollapsedMap(newCollapsed);

      setTimeout(() => {
        const nextEl = document.getElementById(`exercise-card-${nextIdx}`);
        if (nextEl) {
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setCollapsedMap(newCollapsed);
    }
  };

  const handleUnskipExercise = (exIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('success');
    const newSkipped = { ...skippedMap, [exIdx]: false };
    setSkippedMap(newSkipped);

    // Re-open exercise
    const newCollapsed = { ...collapsedMap, [exIdx]: false };
    setCollapsedMap(newCollapsed);
  };


  // Finish Workout Session

  const handleFinishWorkout = async () => {
    if (!routine) return;
    setSubmitting(true);

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    let totalVolumeKg = 0;
    let prCount = 0;

    exerciseLogs.forEach((el) => {
      el.sets.forEach((s) => {
        if (s.completed) {
          totalVolumeKg += (s.weightKg || 0) * (s.reps || 0);
          if (s.isPR) prCount++;
        }
      });
    });

    const payload = {
      routineId: routine.id,
      routineTitle: routine.title,
      date: new Date().toISOString(),
      durationMinutes,
      totalVolumeKg,
      prCount,
      exerciseLogs: exerciseLogs.map((el) => ({
        id: el.exerciseId,
        exerciseId: el.exerciseId,
        exerciseName: el.exerciseName,
        sets: el.sets.filter((s) => s.completed),
      })),

    };


    try {
      const savedLog = await api.saveWorkout(payload);
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}

      // Explicitly mark this specific cycle day as completed
      const allDays = getCustomCycleDays();
      const matchedDay = allDays.find(
        (d) => d.routineId === routine.id || d.title.toLowerCase() === routine.title.toLowerCase()
      ) || allDays[0];
      if (matchedDay) {
        markDayCompleted(matchedDay.dayNum);
      }

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0ea5e9', '#f59e0b', '#10b981'],
      });


      setSummaryData({
        totalVolumeKg: savedLog.totalVolumeKg,
        prCount: savedLog.prCount,
        durationMinutes: savedLog.durationMinutes,
        logId: savedLog.id,
      });

    } catch (err) {
      console.error('Error saving workout:', err);
      alert('Failed to save workout log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Dumbbell className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading BWS live workout session...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 pb-36">

      {/* Top Session Header Banner (Normal flow - Guaranteed ZERO overlap with Exercise 1) */}
      <div className="w-full rounded-2xl glass-panel p-3.5 sm:p-4 shadow-xl border border-blue-500/30 bg-slate-950/90 mb-5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 active:bg-slate-800 transition touch-manipulation min-h-[44px] shrink-0"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-100 truncate uppercase font-condensed tracking-wide">
                {routine?.title}
              </h1>
              <p className="text-[10px] sm:text-xs text-cyan-400 font-bold truncate">
                {routine?.focus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('light');
                setTargetCalcWeight(100);
                setPlateModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-xl bg-amber-400/10 border border-amber-400/40 px-2.5 py-1.5 text-[11px] font-black text-amber-400 uppercase font-condensed tracking-wider active:scale-95 transition shadow-sm"
              title="Barbell Plate Loader & Warmup Calculator"
            >
              <Disc className="h-3.5 w-3.5" />
              <span>Plates</span>
            </button>

            <button
              onClick={() => {
                const allCollapsed = exerciseLogs.every((_, idx) => collapsedMap[idx] !== false);
                if (allCollapsed) expandAllExercises();
                else collapseAllExercises();
              }}
              className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-[11px] font-black text-amber-400 uppercase font-condensed tracking-wider active:scale-95 transition"
              title="Expand or Collapse All Movements"
            >
              <span>{exerciseLogs.every((_, idx) => collapsedMap[idx] !== false) ? 'Expand All' : 'Collapse All'}</span>
            </button>


            <button
              onClick={toggleWorkoutTimer}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold border transition-all touch-manipulation active:scale-95 ${
                isTimerRunning
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-sm shadow-blue-500/20'
                  : 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/20 animate-pulse'
              }`}
            >
              <Clock className={`h-3.5 w-3.5 ${isTimerRunning ? 'animate-spin' : ''}`} />
              <span>{isTimerRunning ? `⏸ ${formatElapsed(elapsedSeconds)}` : `▶ Start (${formatElapsed(elapsedSeconds)})`}</span>
            </button>

            {elapsedSeconds > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Reset workout session timer back to 00:00?')) {
                    resetWorkoutSession();
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800 transition active:scale-95 touch-manipulation min-h-[38px]"
                title="Reset Workout Timer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={handleFinishWorkout}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition touch-manipulation min-h-[38px] border border-emerald-400/40"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{submitting ? 'Saving...' : 'Finish'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exercises List (Accordion Collapsed by Default - Clean Document Flow) */}
      <div className="space-y-4">


        {exerciseLogs.map((exLog, exIdx) => {
          const isCollapsed = collapsedMap[exIdx] !== false; // Collapsed by default!
          const isSkipped = Boolean(skippedMap[exIdx]);
          const completedSetsCount = exLog.sets.filter((s) => s.completed).length;
          const isExDone = !isSkipped && completedSetsCount >= Math.min(3, exLog.sets.length);

          // Find the active exercise (the first non-completed & non-skipped exercise in sequence)
          const firstIncompleteIdx = exerciseLogs.findIndex(
            (el, idx) => !skippedMap[idx] && el.sets.filter((s) => s.completed).length < Math.min(3, el.sets.length)
          );

          const isCurrentActive = !isExDone && !isSkipped && (firstIncompleteIdx === exIdx || !isCollapsed);
          const isUpcoming = !isExDone && !isSkipped && !isCurrentActive;

          let themeBorder = 'border border-slate-800 bg-slate-950/50 opacity-60';

          if (isSkipped) {
            themeBorder =
              'border-l-4 border-l-slate-600 border-t border-r border-b border-slate-800 bg-slate-950/40 opacity-70';
          } else if (isExDone) {
            themeBorder =
              'border-2 border-emerald-500/50 bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950 shadow-lg shadow-emerald-500/10 opacity-90';
          } else if (isCurrentActive) {
            themeBorder =
              'border-2 border-emerald-400 ring-2 ring-emerald-400/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-emerald-950/20 shadow-2xl shadow-emerald-500/25';
          }

          const maxPrevWeight =
            exLog.previousSets && exLog.previousSets.length > 0
              ? Math.max(...exLog.previousSets.map((s) => s.weightKg || 0))
              : 0;

          return (
            <div id={`exercise-card-${exIdx}`} key={exLog.exerciseId + exIdx} className="space-y-2">
              {/* Main Exercise Card (Accordion Container) */}
              <div className={`rounded-3xl p-3.5 sm:p-5 transition-all ${themeBorder}`}>
                {/* Accordion Header Row: Tappable with zero overlap */}
                <div
                  onClick={() => toggleCollapse(exIdx)}
                  className="flex flex-col space-y-2 cursor-pointer select-none"
                >
                  {/* Top Meta Badges Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-black uppercase font-condensed tracking-wider shadow-md ${
                          isSkipped
                            ? 'bg-slate-800 text-slate-400'
                            : isExDone
                            ? 'bg-emerald-400 text-slate-950'
                            : isCurrentActive
                            ? 'bg-emerald-400 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        EX {exIdx + 1}/{exerciseLogs.length}
                      </span>

                      {isSkipped ? (
                        <span className="rounded-xl bg-slate-800/90 text-slate-400 border border-slate-700 px-2.5 py-0.5 text-[10px] font-black uppercase font-condensed tracking-wider flex items-center gap-1 shadow-sm">
                          <FastForward className="h-3 w-3 text-slate-400" /> SKIPPED
                        </span>
                      ) : isExDone ? (
                        <span className="rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-black uppercase font-condensed tracking-wider flex items-center gap-1 shadow-sm">
                          <Check className="h-3 w-3 stroke-[3]" /> DONE
                        </span>
                      ) : isCurrentActive ? (
                        <span className="rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-black uppercase font-condensed tracking-wider flex items-center gap-1 shadow-sm">
                          ⚡ ACTIVE NOW
                        </span>
                      ) : (
                        <span className="rounded-xl bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase font-condensed tracking-wider">
                          UPCOMING
                        </span>
                      )}



                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-800">
                        {exLog.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
                          isSkipped
                            ? 'bg-slate-900 text-slate-500 border-slate-800'
                            : isExDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isCurrentActive
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-black'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {completedSetsCount}/{exLog.sets.length} SETS
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-mono font-black shadow-sm">
                        🏋️ LAST LOAD: {maxPrevWeight > 0 ? `${maxPrevWeight} KG` : `--`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSkipped) {
                          handleUnskipExercise(exIdx, e);
                        } else {
                          toggleCollapse(exIdx);
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 touch-manipulation min-h-[36px] apple-press ${
                        isSkipped
                          ? 'bg-slate-800 text-amber-400 border-slate-700 font-bold'
                          : isExDone && isCollapsed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-black'
                          : isCurrentActive && isCollapsed
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase font-condensed">
                        {isSkipped
                          ? '↺ UNSKIP'
                          : isCollapsed
                          ? isExDone
                            ? '✓ DONE'
                            : isCurrentActive
                            ? '▶ LOG NOW'
                            : 'TAP TO LOG'
                          : 'CLOSE'}
                      </span>
                      {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>


                  {/* Exercise Title & Inline Rename Option */}
                  {renamingExIdx === exIdx ? (
                    <form
                      onSubmit={(e) => handleSaveExerciseRename(exIdx, exLog.exerciseName, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={newExNameInput}
                        onChange={(e) => setNewExNameInput(e.target.value)}
                        className="flex-1 rounded-xl bg-slate-950 border-2 border-amber-400 px-3 py-1.5 text-sm font-black text-amber-400 focus:outline-none uppercase font-condensed"
                        placeholder="Type new exercise name..."
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-amber-400 text-slate-950 px-3.5 py-1.5 text-xs font-black uppercase font-condensed apple-press shrink-0"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingExIdx(null);
                        }}
                        className="rounded-xl bg-slate-800 text-slate-300 px-2.5 py-1.5 text-xs font-bold apple-press shrink-0"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <h3
                        className={`text-lg sm:text-xl font-black font-condensed tracking-wide uppercase leading-tight ${
                          isExDone
                            ? 'text-emerald-400'
                            : isCurrentActive
                            ? 'text-emerald-400 glow-text-emerald font-black'
                            : 'text-slate-300'


                        }`}
                      >
                        {exLog.exerciseName}
                      </h3>
                      <button
                        onClick={(e) => handleStartRenameExercise(exIdx, exLog.exerciseName, e)}
                        className="flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl uppercase font-condensed hover:bg-amber-400/20 apple-press shrink-0 shadow-sm"
                        title="Rename this Exercise"
                      >
                        <Edit3 className="h-3 w-3 text-amber-400" />
                        <span>Rename</span>
                      </button>
                    </div>
                  )}
                </div>




                {/* Expanded Exercise Body */}
                {!isCollapsed && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-fade-in mt-3">
                    {/* Movement Form Guide & Swap Bar */}
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <ExerciseImage
                          exerciseName={exLog.exerciseName}
                          category={exLog.category}
                          className="h-12 w-16 object-cover rounded-xl border border-slate-700 shadow-md shrink-0"
                          notes={exLog.notes}
                        />
                        <div className="text-left min-w-0">
                          <span className="text-[10px] font-black uppercase text-amber-400 font-condensed block truncate">
                            BWS FORM GUIDE
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold block truncate">
                            Tap image for cues & diagrams
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSwapTargetIndex(exIdx);
                          setSwapModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-amber-400 active:bg-slate-800 border border-slate-700 transition touch-manipulation shrink-0 min-h-[40px]"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-[10px] font-black uppercase font-condensed">Swap</span>
                      </button>
                    </div>

                    {/* Ultra-Compact Single-Line Set Rows (All 3+ sets fit on single screen) */}
                    <div className="space-y-1.5">
                      {exLog.sets.map((set, setIdx) => {
                        const prevSet = exLog.previousSets ? exLog.previousSets[setIdx] : undefined;
                        const heroNumber = set.setNum < 10 ? `0${set.setNum}` : `${set.setNum}`;

                        const cardStyle = set.completed
                          ? 'bg-blue-950/40 border-2 border-blue-500/80 shadow-sm'
                          : 'bg-slate-950/80 border border-slate-800/90 hover:border-slate-700';

                        return (
                          <div
                            key={setIdx}
                            className={`flex items-center justify-between gap-1.5 p-1.5 rounded-2xl transition-all ${cardStyle}`}
                          >
                            {/* Set Number Badge */}
                            <div className="flex flex-col items-center justify-center h-9 w-9 rounded-xl bg-slate-900 border border-amber-400/40 shrink-0">
                              <span className="text-[7px] font-black text-amber-400 font-condensed leading-none">SET</span>
                              <span className="text-xs font-black text-slate-100 font-mono leading-none">{heroNumber}</span>
                            </div>

                            {/* Weight Stepper */}
                            <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-0.5 min-h-[38px] flex-1 max-w-[130px]">
                              <button
                                onClick={() => handleAdjustWeight(exIdx, setIdx, -2.5)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 active:bg-slate-700 font-bold shrink-0 touch-manipulation min-h-[36px] min-w-[36px]"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <div className="text-center px-0.5 min-w-0">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={set.weightKg === 0 ? '' : set.weightKg}
                                  onChange={(e) =>
                                    handleUpdateSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder={prevSet ? String(prevSet.weightKg) : '0'}
                                  className="w-10 bg-transparent text-center font-mono font-black text-xs text-slate-100 focus:outline-none"
                                />
                                <span className="block text-[7px] text-slate-400 font-bold uppercase -mt-0.5">KG</span>
                              </div>
                              <button
                                onClick={() => handleAdjustWeight(exIdx, setIdx, 2.5)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-blue-400 active:bg-slate-700 font-bold shrink-0 touch-manipulation min-h-[36px] min-w-[36px]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Reps Stepper */}
                            <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-0.5 min-h-[38px] flex-1 max-w-[105px]">
                              <button
                                onClick={() => handleAdjustReps(exIdx, setIdx, -1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 active:bg-slate-700 font-bold shrink-0 touch-manipulation min-h-[36px] min-w-[36px]"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <div className="text-center px-0.5 min-w-0">
                                <input
                                  type="number"
                                  value={set.reps === 0 ? '' : set.reps}
                                  onChange={(e) =>
                                    handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)
                                  }
                                  placeholder={prevSet ? String(prevSet.reps) : '8'}
                                  className="w-8 bg-transparent text-center font-mono font-black text-xs text-slate-100 focus:outline-none"
                                />
                                <span className="block text-[7px] text-slate-400 font-bold uppercase -mt-0.5">REPS</span>
                              </div>
                              <button
                                onClick={() => handleAdjustReps(exIdx, setIdx, 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-blue-400 active:bg-slate-700 font-bold shrink-0 touch-manipulation min-h-[36px] min-w-[36px]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Checkmark Completion Button */}
                            <button
                              onClick={() => handleToggleSet(exIdx, setIdx)}
                              className={`flex h-9 w-10 items-center justify-center rounded-xl border font-black transition-all touch-manipulation active:scale-95 shrink-0 min-h-[38px] ${
                                set.completed
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-100 border-blue-400 shadow-md'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 active:bg-slate-800'
                              }`}
                            >
                              <Check className={`h-4 w-4 ${set.completed ? 'stroke-[3.5]' : 'stroke-[2.5]'}`} />
                            </button>

                            {/* Delete Set Icon */}
                            <button
                              onClick={() => handleDeleteSet(exIdx, setIdx)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition active:scale-95 shrink-0"
                              title="Delete Set"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons: Add Set & Manual Start Rest Timer */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleAddSet(exIdx)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-slate-300 active:bg-slate-800 border border-slate-800 transition touch-manipulation min-h-[38px]"
                      >
                        <Plus className="h-3.5 w-3.5 text-blue-400" /> Add Extra Set
                      </button>

                      <button
                        onClick={() => restTimer.startTimer(exLog.restSeconds || 120, exLog.exerciseName)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/20 py-2 text-xs font-extrabold text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 active:scale-95 transition touch-manipulation min-h-[38px]"
                      >
                        <Timer className="h-3.5 w-3.5 text-amber-400" /> Rest ({exLog.restSeconds || 120}s)
                      </button>
                    </div>

                    {/* DONE WITH EXERCISE BUTTON - Unlocks when 3 sets (or all sets) are completed */}
                    {completedSetsCount >= Math.min(3, exLog.sets.length) ? (
                      <button
                        onClick={() => handleDoneWithExercise(exIdx)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black uppercase font-condensed tracking-wider text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-300 transition apple-press shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>
                          {exIdx + 1 < exerciseLogs.length
                            ? `DONE WITH EXERCISE • OPEN EX ${exIdx + 2} →`
                            : '🏆 ALL MOVEMENTS DONE • PROCEED TO FINISH'}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-slate-400 font-bold text-center text-xs uppercase tracking-wider font-condensed mt-2 flex items-center justify-center gap-2">
                        <span>Complete {Math.min(3, exLog.sets.length)} sets to unlock Done button ({completedSetsCount}/{Math.min(3, exLog.sets.length)} completed)</span>
                      </div>
                    )}

                    {/* SKIP THIS EXERCISE BUTTON (For when short on time) */}
                    <button
                      onClick={() => handleSkipExercise(exIdx)}
                      className="w-full py-2.5 rounded-2xl bg-slate-900/90 text-slate-400 hover:text-amber-400 active:bg-slate-800 border border-slate-800 font-extrabold uppercase font-condensed tracking-wider text-xs flex items-center justify-center gap-2 mt-2 transition touch-manipulation apple-press"
                    >
                      <FastForward className="h-4 w-4 text-slate-400" />
                      <span>SKIP THIS EXERCISE (SHORT ON TIME) →</span>
                    </button>

                  </div>
                )}
              </div>
            </div>

          );
        })}

      </div>





      {/* Exercise Swap Modal */}
      {swapTargetIndex !== null && (
        <ExerciseSwapModal
          isOpen={swapModalOpen}
          onClose={() => {
            setSwapModalOpen(false);
            setSwapTargetIndex(null);
          }}
          currentExerciseName={exerciseLogs[swapTargetIndex]?.exerciseName || ''}
          recommendedAlternatives={exerciseLogs[swapTargetIndex]?.alternatives || []}
          onSwap={handleSwapExercise}
        />
      )}

      {/* Session Finish Celebration Summary Modal */}
      {summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-cyan-500/40 text-center space-y-4 animate-scale-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto shadow-lg shadow-orange-500/30">
              <Trophy className="h-8 w-8 text-slate-950 stroke-[2.5]" />
            </div>

            <h2 className="text-xl font-black text-slate-100 glow-text">Workout Complete!</h2>
            <p className="text-xs text-slate-300">
              Session volume and personal records saved to your BWS profile.
            </p>

            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Volume</span>
                <p className="text-base font-black text-cyan-400">{summaryData.totalVolumeKg} KG</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">PRs Hit</span>
                <p className="text-base font-black text-amber-400">{summaryData.prCount}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Duration</span>
                <p className="text-base font-black text-slate-200">{summaryData.durationMinutes} min</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-xs font-black text-slate-100 uppercase tracking-wider font-condensed shadow-lg shadow-cyan-500/20 active:scale-95 transition"
              >
                DONE & RETURN TO DASHBOARD
              </button>
              <button
                onClick={async () => {
                  if (summaryData?.logId) {
                    triggerHaptic('warning');
                    await api.deleteWorkout(summaryData.logId, user?.uid);
                  }
                  setSummaryData(null);
                }}
                className="w-full rounded-xl bg-slate-900 border border-rose-500/40 py-2.5 text-[11px] font-black text-rose-300 hover:text-rose-200 hover:bg-slate-800 uppercase tracking-wider font-condensed transition apple-press shadow-sm"
              >
                ↩ UNCOMPLETE & RE-OPEN SESSION
              </button>

            </div>
          </div>
        </div>
      )}

      {/* PLATE CALCULATOR MODAL */}
      <PlateCalculatorModal
        isOpen={plateModalOpen}
        onClose={() => setPlateModalOpen(false)}
        initialWeightKg={targetCalcWeight}
      />
    </div>
  );
};


