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
  ShieldCheck,
  BookOpen,
  ChevronRight,
  ChevronLeft,
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
import { FormGuideDrawer } from '../components/FormGuideDrawer';
import {
  getExerciseUnitPreference,
  saveExerciseUnitPreference,
  kgToLbs,
  lbsToKg,
  formatWeight,
  WeightUnit,
} from '../utils/unitConverter';


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
  const [isZenMode, setIsZenMode] = useState<boolean>(true);

  // Active Stage Index (Single Exercise Focus Stage)
  const [activeExIdx, setActiveExIdx] = useState<number>(0);

  // Per-Exercise Unit Preference Map ('kg' | 'lbs')
  const [unitMap, setUnitMap] = useState<Record<number, WeightUnit>>({});

  // Form Guide Bottom Drawer State
  const [formGuideDrawerOpen, setFormGuideDrawerOpen] = useState<boolean>(false);
  const [selectedFormGuideExercise, setSelectedFormGuideExercise] = useState<Exercise | null>(null);

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
    logId?: string;
  } | null>(null);



  // Rest Timer Hook
  const restTimer = useRestTimer();

  const SESSION_KEY = `bws_live_session_${id || 'active'}`;

  // Fetch Routine & Initialize
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([api.getRoutineById(id), api.getWorkouts(user?.uid)])
      .then(([data, workouts]) => {
        if (!data) return;
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

        // Initialize fresh logs with PREVIOUS LOAD WEIGHT pre-filled
        if (data.exercises) {
          const initialUnitMap: Record<number, WeightUnit> = {};
          const initialLogs: LiveExerciseLog[] = data.exercises.map((ex, idx) => {
            initialUnitMap[idx] = getExerciseUnitPreference(ex.id);
            const defaultSetCount = ex.defaultSets || 3;
            const prevSets = ex.previousSets && ex.previousSets.length > 0 ? ex.previousSets : findPrevSets(ex.id);
            const maxPrevWeight = prevSets.length > 0 ? Math.max(...prevSets.map((s) => s.weightKg || 0)) : 0;

            const sets: LiveSetLog[] = Array.from({ length: defaultSetCount }).map((_, setIdx) => {
              const prev = prevSets[setIdx];
              const prefilledWeight = prev && prev.weightKg > 0 ? prev.weightKg : maxPrevWeight;

              return {
                setNum: setIdx + 1,
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
          setUnitMap(initialUnitMap);
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


  // Persist session state
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
          activeExIdx,
          unitMap,
        })
      );
    } catch (e) {
      console.warn('Session save note:', e);
    }
  }, [id, elapsedSeconds, isTimerRunning, exerciseLogs, activeExIdx, unitMap]);

  // Timer
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

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Toggle Per-Exercise Unit (KG <-> LBS)
  const handleToggleUnit = (exIdx: number) => {
    triggerHaptic('light');
    const currentUnit = unitMap[exIdx] || 'kg';
    const newUnit: WeightUnit = currentUnit === 'kg' ? 'lbs' : 'kg';

    setUnitMap((prev) => ({ ...prev, [exIdx]: newUnit }));

    const exId = exerciseLogs[exIdx]?.exerciseId;
    if (exId) {
      saveExerciseUnitPreference(exId, newUnit);
    }
  };

  // Set updates
  const handleUpdateWeight = (exIndex: number, setIndex: number, valDisplay: number) => {
    const unit = unitMap[exIndex] || 'kg';
    const weightKg = unit === 'lbs' ? lbsToKg(valDisplay) : valDisplay;

    const updated = [...exerciseLogs];
    updated[exIndex].sets[setIndex].weightKg = Math.max(0, weightKg);
    setExerciseLogs(updated);
  };

  const handleUpdateReps = (exIndex: number, setIndex: number, repsVal: number) => {
    const updated = [...exerciseLogs];
    updated[exIndex].sets[setIndex].reps = Math.max(1, repsVal);
    setExerciseLogs(updated);
  };

  const handleToggleCompleted = (exIndex: number, setIndex: number) => {
    triggerHaptic('medium');

    const updated = [...exerciseLogs];
    const targetSet = updated[exIndex].sets[setIndex];
    const isNowCompleted = !targetSet.completed;
    targetSet.completed = isNowCompleted;

    if (isNowCompleted) {
      const prevSets = updated[exIndex].previousSets || [];
      const maxPrevWeight = prevSets.length > 0 ? Math.max(...prevSets.map((s) => s.weightKg || 0)) : 0;
      targetSet.isPR = targetSet.weightKg > maxPrevWeight && targetSet.weightKg > 0;

      if (targetSet.isPR) {
        triggerHaptic('success');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3b82f6', '#f59e0b', '#10b981'],
        });
      }

      const restTime = updated[exIndex].restSeconds || 120;
      restTimer.startTimer(restTime, updated[exIndex].exerciseName);
    }

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
      const savedLog = await api.saveWorkout(payload, user?.email || user?.uid);
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}

      const allDays = getCustomCycleDays();
      const matchedDay =
        allDays.find((d) => d.routineId === routine.id || d.title.toLowerCase() === routine.title.toLowerCase()) ||
        allDays[0];
      if (matchedDay) {
        markDayCompleted(matchedDay.dayNum);
      }

      setSummaryData({
        totalVolumeKg: Math.round(totalVolumeKg),
        prCount,
        durationMinutes,
        logId: savedLog.id,
      });

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#10b981'],
      });
    } catch (err) {
      console.error('Error saving workout session:', err);
      alert('Failed to save workout session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Dumbbell className="h-8 w-8 text-gym-primary animate-spin" />
        <p className="text-xs text-gym-muted font-bold uppercase tracking-wider font-condensed">
          Loading Stage Mode...
        </p>
      </div>
    );
  }

  const currentLog = exerciseLogs[activeExIdx] || exerciseLogs[0];
  const currentUnit = unitMap[activeExIdx] || 'kg';
  const fullExerciseMeta = routine?.exercises?.find(
    (e) => e.id === currentLog?.exerciseId || e.name === currentLog?.exerciseName
  );

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto w-full px-2 sm:px-4">
      {/* Top Session Header Bar */}
      <div className="w-full rounded-3xl glass-panel-impeccable p-4 sm:p-5 shadow-2xl border border-gym-border space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-gym-muted hover:text-gym-text bg-gym-bg border border-gym-border apple-press"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gym-primary uppercase font-condensed tracking-wider apple-display-title">
                {routine?.title}
              </h1>
              <p className="text-xs text-gym-muted font-semibold">{routine?.focus}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsZenMode((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black uppercase font-condensed tracking-wider transition apple-press border ${
                isZenMode
                  ? 'bg-gym-secondary text-slate-950 border-gym-secondary shadow-md font-extrabold'
                  : 'bg-gym-bg text-gym-muted border-gym-border hover:text-gym-text'
              }`}
            >
              <span>{isZenMode ? '🧘 Zen Focus' : '📋 Routine View'}</span>
            </button>

            <button
              onClick={toggleWorkoutTimer}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold border transition-all apple-press ${
                isTimerRunning
                  ? 'bg-gym-primary/20 border-gym-primary/50 text-gym-primary'
                  : 'bg-gym-secondary text-slate-950 border-gym-secondary shadow-md'
              }`}
            >
              <Clock className={`h-3.5 w-3.5 ${isTimerRunning ? 'animate-spin' : ''}`} />
              <span>{isTimerRunning ? `⏸ ${formatElapsed(elapsedSeconds)}` : `▶ Start (${formatElapsed(elapsedSeconds)})`}</span>
            </button>

            <button
              onClick={handleFinishWorkout}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-gym-primary hover:opacity-90 px-4 py-1.5 text-xs font-black text-slate-950 shadow-md apple-press border border-gym-primary uppercase font-condensed tracking-wider"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{submitting ? 'Saving...' : 'Finish'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE EXERCISE FOCUS STAGE CARD */}
      {currentLog && (
        <div className="w-full rounded-3xl glass-panel-impeccable p-5 sm:p-6 border border-gym-border shadow-2xl space-y-6 text-gym-text">
          {/* Stage Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap border-b border-gym-border pb-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gym-border shrink-0 bg-gym-bg shadow-md">
                <ExerciseImage exerciseName={currentLog.exerciseName} category={currentLog.category} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gym-secondary font-mono">
                    EXERCISE {activeExIdx + 1} OF {exerciseLogs.length} • {currentLog.category}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-gym-primary font-condensed tracking-wide leading-none apple-display-title pt-0.5">
                  {currentLog.exerciseName}
                </h2>
                {currentLog.previousSets && currentLog.previousSets.length > 0 && (
                  <p className="text-[11px] font-mono font-bold text-gym-muted pt-1">
                    Best Previous:{' '}
                    <span className="text-gym-secondary font-black">
                      {formatWeight(Math.max(...currentLog.previousSets.map((s) => s.weightKg || 0)), currentUnit)} × {currentLog.previousSets[0]?.reps || 8}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Per-Machine Unit Switcher & Quick Tools */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Unit Selector Toggle Pill (KG <-> LBS) */}
              <button
                onClick={() => handleToggleUnit(activeExIdx)}
                className="flex items-center gap-1.5 rounded-xl bg-gym-bg border border-gym-secondary/40 px-3 py-1.5 text-xs font-black text-gym-secondary uppercase font-mono tracking-wider apple-press shadow-sm hover:bg-gym-secondary/15 transition"
                title="Switch weight unit between KG and LBS for this machine"
              >
                <span className="text-[10px] text-gym-muted font-bold">UNIT:</span>
                <span className="bg-gym-secondary text-slate-950 px-2 py-0.5 rounded-md text-xs font-black shadow-sm">
                  {currentUnit.toUpperCase()}
                </span>
              </button>

              {/* Form Guide Drawer Trigger */}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setSelectedFormGuideExercise(fullExerciseMeta || {
                    id: currentLog.exerciseId,
                    name: currentLog.exerciseName,
                    category: currentLog.category,
                    defaultSets: 3,
                    targetReps: '8-10',
                    minReps: 8,
                    maxReps: 10,
                    restSeconds: currentLog.restSeconds,
                    notes: currentLog.notes,
                    alternatives: currentLog.alternatives,
                  });
                  setFormGuideDrawerOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gym-primary/15 hover:bg-gym-primary/25 border border-gym-primary/40 px-3 py-1.5 text-xs font-black text-gym-primary uppercase font-condensed tracking-wider apple-press shadow-sm"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Form Guide</span>
              </button>
            </div>
          </div>

          {/* Set Progress Indicators Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentLog.sets.map((s, idx) => (
              <button
                key={s.setNum}
                onClick={() => {
                  triggerHaptic('light');
                  // Move focus to this set
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition apple-press shrink-0 ${
                  s.completed
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-gym-bg text-gym-muted border-gym-border'
                }`}
              >
                <span>SET {s.setNum}</span>
                {s.completed ? <Check className="h-3 w-3 stroke-[3]" /> : null}
              </button>
            ))}
          </div>

          {/* ZEN FOCUS MODE HERO CARD OR TABLE */}
          {isZenMode ? (
            (() => {
              const activeSetIdx = currentLog.sets.findIndex((s) => !s.completed);
              const targetSetIdx = activeSetIdx !== -1 ? activeSetIdx : currentLog.sets.length - 1;
              const activeSet = currentLog.sets[targetSetIdx];
              const displayWeight = currentUnit === 'lbs' ? kgToLbs(activeSet.weightKg) : activeSet.weightKg;
              const stepVal = currentUnit === 'lbs' ? 5 : 2.5;

              return (
                <div className="space-y-6 bg-gym-bg/80 p-5 sm:p-6 rounded-3xl border border-gym-border shadow-inner">
                  {/* Hero Set Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-950 bg-gym-primary px-3 py-1 rounded-xl font-mono shadow-md">
                      SET {activeSet.setNum} OF {currentLog.sets.length}
                    </span>
                    <span className="text-xs font-bold font-mono text-gym-muted bg-gym-card px-3 py-1 rounded-xl border border-gym-border">
                      Target: {fullExerciseMeta?.targetReps || '8-10'} Reps • {currentLog.restSeconds || 90}s Rest
                    </span>
                  </div>

                  {/* Giant Weight & Reps Stepper Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Weight Stepper */}
                    <div className="p-4 rounded-2xl bg-gym-card border border-gym-border space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-gym-muted uppercase font-mono">
                        <span>WEIGHT</span>
                        <span className="text-gym-secondary font-black">{currentUnit.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            const nextVal = Math.max(0, displayWeight - stepVal);
                            handleUpdateWeight(activeExIdx, targetSetIdx, nextVal);
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gym-bg hover:bg-gym-border text-gym-text font-black text-lg border border-gym-border apple-press shrink-0"
                        >
                          -<span className="text-xs">{stepVal}</span>
                        </button>
                        <input
                          type="number"
                          step={stepVal.toString()}
                          value={displayWeight || ''}
                          onChange={(e) => handleUpdateWeight(activeExIdx, targetSetIdx, parseFloat(e.target.value) || 0)}
                          className="w-full text-center rounded-2xl bg-gym-bg border border-gym-border py-2 text-2xl font-black font-mono text-gym-primary focus:border-gym-primary focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            const nextVal = displayWeight + stepVal;
                            handleUpdateWeight(activeExIdx, targetSetIdx, nextVal);
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gym-bg hover:bg-gym-border text-gym-text font-black text-lg border border-gym-border apple-press shrink-0"
                        >
                          +<span className="text-xs">{stepVal}</span>
                        </button>
                      </div>
                    </div>

                    {/* Reps Stepper */}
                    <div className="p-4 rounded-2xl bg-gym-card border border-gym-border space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-gym-muted uppercase font-mono">
                        <span>COMPLETED REPS</span>
                        <span className="text-gym-primary font-black">REPS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            const nextVal = Math.max(1, (activeSet.reps || 1) - 1);
                            handleUpdateReps(activeExIdx, targetSetIdx, nextVal);
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gym-bg hover:bg-gym-border text-gym-text font-black text-lg border border-gym-border apple-press shrink-0"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          value={activeSet.reps || ''}
                          onChange={(e) => handleUpdateReps(activeExIdx, targetSetIdx, parseInt(e.target.value, 10) || 0)}
                          className="w-full text-center rounded-2xl bg-gym-bg border border-gym-border py-2 text-2xl font-black font-mono text-gym-secondary focus:border-gym-secondary focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            const nextVal = (activeSet.reps || 0) + 1;
                            handleUpdateReps(activeExIdx, targetSetIdx, nextVal);
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gym-bg hover:bg-gym-border text-gym-text font-black text-lg border border-gym-border apple-press shrink-0"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GIANT 1-TAP COMPLETE SET ACTION BUTTON */}
                  <button
                    onClick={() => {
                      handleToggleCompleted(activeExIdx, targetSetIdx);
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg uppercase font-condensed tracking-widest flex items-center justify-center gap-2 shadow-2xl transition apple-press ${
                      activeSet.completed
                        ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
                        : 'bg-gym-primary hover:opacity-90 text-slate-950 font-extrabold shadow-gym-primary/30 border border-gym-primary'
                    }`}
                  >
                    <Check className="h-6 w-6 stroke-[3]" />
                    <span>
                      {activeSet.completed
                        ? `SET ${activeSet.setNum} COMPLETED ✓`
                        : `COMPLETE SET ${activeSet.setNum} ⚡`}
                    </span>
                  </button>
                </div>
              );
            })()
          ) : (
            /* STANDARD TABLE OVERVIEW MODE */
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-gym-muted font-mono tracking-wider border-b border-gym-border pb-1.5">
                <span className="col-span-2">SET</span>
                <span className="col-span-4 text-center">WEIGHT ({currentUnit.toUpperCase()})</span>
                <span className="col-span-3 text-center">REPS</span>
                <span className="col-span-3 text-right">ACTION</span>
              </div>

              {currentLog.sets.map((set, setIdx) => {
                const displayWeight = currentUnit === 'lbs' ? kgToLbs(set.weightKg) : set.weightKg;

                return (
                  <div
                    key={set.setNum}
                    className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl border transition-all ${
                      set.completed
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-gym-bg border-gym-border hover:border-gym-primary/40'
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-xl font-mono text-xs font-black ${
                          set.completed
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-gym-card text-gym-primary border border-gym-border'
                        }`}
                      >
                        {set.setNum}
                      </span>
                    </div>

                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step={currentUnit === 'lbs' ? '1' : '0.5'}
                        value={displayWeight || ''}
                        onChange={(e) => handleUpdateWeight(activeExIdx, setIdx, parseFloat(e.target.value) || 0)}
                        className="w-full text-center rounded-xl bg-gym-card border border-gym-border px-2 py-1.5 text-sm font-mono font-bold text-gym-text focus:border-gym-primary focus:outline-none"
                      />
                      <span className="text-[10px] font-mono font-bold text-gym-muted shrink-0">{currentUnit}</span>
                    </div>

                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => handleUpdateReps(activeExIdx, setIdx, parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center rounded-xl bg-gym-card border border-gym-border px-2 py-1.5 text-sm font-mono font-bold text-gym-text focus:border-gym-primary focus:outline-none"
                      />
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleCompleted(activeExIdx, setIdx)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black uppercase font-condensed tracking-wider transition apple-press flex items-center justify-center gap-1 ${
                          set.completed
                            ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-md'
                            : 'bg-gym-primary text-slate-950 hover:opacity-90 font-bold'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>{set.completed ? 'LOGGED' : 'LOG'}</span>
                      </button>

                      {currentLog.sets.length > 1 && (
                        <button
                          onClick={() => handleDeleteSet(activeExIdx, setIdx)}
                          className="p-1.5 rounded-lg text-gym-muted hover:text-rose-400 apple-press"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => handleAddSet(activeExIdx)}
                className="w-full py-2 rounded-2xl bg-gym-bg hover:bg-gym-card border border-dashed border-gym-border text-gym-muted hover:text-gym-text font-black uppercase font-condensed tracking-wider text-xs flex items-center justify-center gap-1.5 apple-press transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD EXTRA SET</span>
              </button>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-gym-border flex-wrap gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveExIdx((prev) => Math.max(0, prev - 1));
              }}
              disabled={activeExIdx === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase font-condensed tracking-wider apple-press border ${
                activeExIdx === 0
                  ? 'bg-gym-bg text-gym-muted border-gym-border opacity-50 cursor-not-allowed'
                  : 'bg-gym-bg text-gym-text border-gym-border hover:border-gym-primary'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>PREVIOUS</span>
            </button>

            {activeExIdx + 1 < exerciseLogs.length ? (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setActiveExIdx((prev) => Math.min(exerciseLogs.length - 1, prev + 1));
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gym-primary text-slate-950 text-xs font-black uppercase font-condensed tracking-wider apple-press shadow-md border border-gym-primary font-extrabold"
              >
                <span>NEXT EXERCISE ({activeExIdx + 2}/{exerciseLogs.length})</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={handleFinishWorkout}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 text-xs font-black uppercase font-condensed tracking-wider apple-press shadow-lg font-extrabold"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>ALL DONE • FINISH WORKOUT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* UP NEXT PEEK DRAWER (Zen Focus Mode) */}
      {isZenMode && activeExIdx + 1 < exerciseLogs.length && (
        <div
          onClick={() => {
            triggerHaptic('medium');
            setActiveExIdx(activeExIdx + 1);
          }}
          className="w-full rounded-2xl bg-gym-card/60 hover:bg-gym-card p-4 border border-gym-border shadow-lg flex items-center justify-between cursor-pointer apple-press transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gym-border shrink-0 bg-gym-bg">
              <ExerciseImage exerciseName={exerciseLogs[activeExIdx + 1].exerciseName} category={exerciseLogs[activeExIdx + 1].category} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-gym-muted font-mono">
                UP NEXT (EXERCISE {activeExIdx + 2}/{exerciseLogs.length})
              </span>
              <h4 className="text-sm font-black uppercase text-gym-text font-condensed truncate">
                {exerciseLogs[activeExIdx + 1].exerciseName}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-gym-primary uppercase font-condensed shrink-0">
            <span>START NEXT →</span>
          </div>
        </div>
      )}

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


