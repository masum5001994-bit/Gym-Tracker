import React, { useEffect, useState } from 'react';
import { Calendar, Moon, Play, AlertCircle, RotateCcw, Edit3, CheckCircle2 } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { WorkoutLog } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import { getCustomCycleDays, CustomCycleDay } from '../utils/cycleCustomizer';
import {
  getCompletedDayNums,
  getCycleWeekNumber,
  resetCycleCompletion,
} from '../utils/cycleCompletion';


const REST_DAY_THEME = {
  bg: 'bg-gym-card',
  border: 'border-gym-border hover:border-slate-500',
  activeRing: 'ring-2 ring-gym-border shadow-md',
  badgeBg: 'bg-gym-border text-gym-muted border-gym-border',
  titleColor: 'text-gym-muted',
  buttonBg: 'bg-gym-bg text-gym-muted border-gym-border',
  tagColor: 'text-gym-muted',
};

const WORKOUT_DAY_THEMES = [
  // Day 1 (Workout): Primary Theme Accent
  {
    bg: 'bg-gym-card',
    border: 'border-gym-primary/60 hover:border-gym-primary',
    activeRing: 'ring-2 ring-gym-primary/80 shadow-lg',
    badgeBg: 'bg-gym-primary text-slate-950 font-black border-gym-primary',
    titleColor: 'text-gym-primary',
    buttonBg: 'bg-gym-primary text-slate-950 hover:opacity-90 font-black shadow-md border-gym-primary',
    tagColor: 'text-gym-primary',
  },
  // Day 2 (Workout): Secondary Theme Accent
  {
    bg: 'bg-gym-card',
    border: 'border-gym-secondary/60 hover:border-gym-secondary',
    activeRing: 'ring-2 ring-gym-secondary/80 shadow-md',
    badgeBg: 'bg-gym-secondary text-slate-950 border-gym-secondary',
    titleColor: 'text-gym-secondary',
    buttonBg: 'bg-gym-secondary text-slate-950 hover:opacity-90 border-gym-secondary',
    tagColor: 'text-gym-secondary',
  },
  // Day 4 (Workout): Primary Theme Accent
  {
    bg: 'bg-gym-card',
    border: 'border-gym-primary/60 hover:border-gym-primary',
    activeRing: 'ring-2 ring-gym-primary/80 shadow-md',
    badgeBg: 'bg-gym-primary text-slate-950 border-gym-primary',
    titleColor: 'text-gym-primary',
    buttonBg: 'bg-gym-primary text-slate-950 hover:opacity-90 border-gym-primary',
    tagColor: 'text-gym-primary',
  },
  // Day 5 (Workout): Secondary Theme Accent
  {
    bg: 'bg-gym-card',
    border: 'border-gym-secondary/60 hover:border-gym-secondary',
    activeRing: 'ring-2 ring-gym-secondary/80 shadow-md',
    badgeBg: 'bg-gym-secondary text-slate-950 border-gym-secondary',
    titleColor: 'text-gym-secondary',
    buttonBg: 'bg-gym-secondary text-slate-950 hover:opacity-90 border-gym-secondary',
    tagColor: 'text-gym-secondary',
  },
  // Day 6 (Workout): Primary Theme Accent
  {
    bg: 'bg-gym-card',
    border: 'border-gym-primary/60 hover:border-gym-primary',
    activeRing: 'ring-2 ring-gym-primary/80 shadow-md',
    badgeBg: 'bg-gym-primary text-slate-950 border-gym-primary',
    titleColor: 'text-gym-primary',
    buttonBg: 'bg-gym-primary text-slate-950 hover:opacity-90 border-gym-primary',
    tagColor: 'text-gym-primary',
  },
];

export const WeeklyScheduleCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [cycleDays, setCycleDays] = useState<CustomCycleDay[]>(getCustomCycleDays());
  const [completedDayNums, setCompletedDayNums] = useState<number[]>(getCompletedDayNums());
  const [weekNumber, setWeekNumber] = useState<number>(getCycleWeekNumber());

  const fetchLogs = () => {
    api
      .getWorkouts(user?.uid)
      .then(setWorkoutLogs)
      .catch(console.error);
  };

  useEffect(() => {
    fetchLogs();

    const handleUpdate = () => {
      setCycleDays(getCustomCycleDays());
      setCompletedDayNums(getCompletedDayNums());
      setWeekNumber(getCycleWeekNumber());
    };

    window.addEventListener('cycle_days_updated', handleUpdate);
    window.addEventListener('cycle_completion_updated', handleUpdate);

    return () => {
      window.removeEventListener('cycle_days_updated', handleUpdate);
      window.removeEventListener('cycle_completion_updated', handleUpdate);
    };
  }, [user]);

  const handleResetLogs = async () => {
    if (window.confirm('Reset all logged workout sessions? This will uncomplete Day 1 and reset your cycle.')) {
      triggerHaptic('warning');
      resetCycleCompletion();
      await api.clearAllWorkouts(user?.uid);
      setWorkoutLogs([]);
    }
  };

  const completedWorkouts = workoutLogs.filter((w) => !(w as any).deleted);
  const activeDay = cycleDays.find((d) => !completedDayNums.includes(d.dayNum)) || cycleDays[0];

  let daysSinceLastWorkout = 0;
  let isMissed = false;

  if (completedWorkouts.length > 0) {
    const lastDate = new Date(completedWorkouts[0].date);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    daysSinceLastWorkout = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (daysSinceLastWorkout >= 2) {
      isMissed = true;
    }
  }

  // Count workout days to pick unique theme per workout
  let workoutDayCounter = 0;

  return (
    <div className="w-full rounded-3xl glass-panel p-4 sm:p-6 border border-gym-border shadow-2xl space-y-6 bg-gym-card text-gym-text">
      {/* HERO TEXT HEADER */}
      <div className="space-y-2 border-b border-gym-border pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/20 border border-gym-primary/50 text-gym-primary shadow-md shrink-0">
              <Calendar className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              {/* HERO TEXT */}
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-gym-primary font-condensed tracking-wider leading-none apple-display-title">
                  7-DAY WORKOUT SCHEDULE
                </h1>
                <span className="text-xs font-black text-slate-950 bg-gym-secondary px-2.5 py-0.5 rounded-lg font-mono shrink-0 shadow-sm border border-gym-secondary">
                  WEEK {weekNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gym-muted font-bold pt-1">
                5 Science Workouts • 2 Active Rest Days (Auto-Resets Every 7 Days)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                navigate('/profile');
              }}
              className="flex items-center gap-1.5 text-xs font-black text-gym-secondary bg-gym-secondary/15 hover:bg-gym-secondary/25 px-3 py-1.5 rounded-xl border border-gym-secondary/40 uppercase tracking-wider font-condensed transition apple-press shadow-sm"
              title="Rename Days & Custom Exercises"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Customize</span>
            </button>

            {(completedWorkouts.length > 0 || completedDayNums.length > 0) && (
              <button
                onClick={handleResetLogs}
                className="flex items-center gap-1.5 text-xs font-black text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-1.5 rounded-xl border border-rose-500/40 uppercase tracking-wider font-condensed transition apple-press shadow-sm"
                title="Reset Cycle Progress"
              >
                <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Missed Day Alert */}
      {isMissed && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              {daysSinceLastWorkout} days idle! Next: <strong className="underline text-gym-secondary">{activeDay.title}</strong>.
            </span>
          </div>
          {activeDay.type === 'workout' && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                navigate(`/workout/${activeDay.routineId || 'custom-session'}`);
              }}
              className="rounded-xl bg-rose-500 text-slate-950 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shrink-0 apple-press shadow-md"
            >
              Resume
            </button>
          )}
        </div>
      )}

      {/* CARDS VIEW FOR ALL DAYS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {cycleDays.map((item) => {
          const isPast = completedDayNums.includes(item.dayNum);
          const isActive = item.dayNum === activeDay.dayNum && !isPast;

          let theme = REST_DAY_THEME;
          if (item.type === 'workout') {
            theme = WORKOUT_DAY_THEMES[workoutDayCounter % WORKOUT_DAY_THEMES.length];
            workoutDayCounter++;
          }

          return (
            <div
              key={item.dayLabel}
              onClick={() => {
                triggerHaptic('light');
                if (item.type === 'workout') {
                  navigate(`/workout/${item.routineId || 'custom-session'}`);
                }
              }}
              className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 transition-all cursor-pointer apple-press shadow-lg space-y-3 flex flex-col justify-between ${theme.bg} ${theme.border} ${
                isActive ? theme.activeRing : ''
              }`}
            >
              {/* Day Card Header */}
              <div className="flex flex-col gap-2 border-b border-gym-border pb-3">
                <div className="flex items-center justify-between gap-2">
                  {/* HERO DAY BADGE */}
                  <span
                    className={`text-xs sm:text-sm font-black uppercase font-mono px-3 py-1 rounded-xl border shrink-0 shadow-md ${
                      isActive
                        ? `${theme.badgeBg} font-extrabold ring-2 ring-black/20`
                        : isPast
                        ? 'bg-emerald-500/25 text-emerald-400 border-emerald-500/50'
                        : `${theme.badgeBg} opacity-90`
                    }`}
                  >
                    {item.dayLabel}
                  </span>

                  {/* Status Pill / Top Right Action */}
                  {isActive && item.type === 'workout' ? (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 bg-gym-secondary px-2.5 py-0.5 rounded-lg shrink-0 shadow-md border border-gym-secondary">
                      ACTIVE NOW
                    </span>
                  ) : isPast ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('light');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className="text-[10px] sm:text-xs font-bold text-gym-muted hover:text-gym-text font-condensed flex items-center gap-1 shrink-0 bg-gym-bg px-2.5 py-1 rounded-lg border border-gym-border transition apple-press"
                      title="Re-log this workout session"
                    >
                      <RotateCcw className="h-3 w-3 text-gym-muted" />
                      <span>Re-log</span>
                    </button>
                  ) : item.type === 'rest' ? (
                    <span className="text-xs font-extrabold text-gym-muted font-mono flex items-center gap-1 shrink-0 bg-gym-bg px-2.5 py-0.5 rounded-lg border border-gym-border">
                      <Moon className="h-3.5 w-3.5 text-gym-muted" /> REST
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gym-muted font-mono shrink-0">READY</span>
                  )}
                </div>

                {/* HERO ROUTINE TITLE & EXERCISE DESCRIPTION */}
                <div className="min-w-0 pt-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h3 className={`text-base sm:text-xl font-black uppercase tracking-wide font-condensed leading-tight apple-display-title ${theme.titleColor}`}>
                      {item.title}
                    </h3>
                    {item.exerciseCount && (
                      <span className="text-[10px] sm:text-xs font-black uppercase font-mono text-gym-muted bg-gym-bg px-2.5 py-0.5 rounded-md border border-gym-border">
                        {item.exerciseCount} EXERCISES • ~{item.estimatedMinutes || 45}M
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gym-text font-extrabold leading-snug">
                    {item.focus}
                  </p>
                </div>
              </div>

              {/* Action Area inside Card */}
              <div className="pt-1">
                {item.type === 'workout' ? (
                  isPast ? (
                    /* Single Prominent Big DONE Banner for Completed Days */
                    <div className="py-2.5 sm:py-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center gap-2 shadow-inner">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" />
                      <span className="text-base sm:text-lg font-black uppercase font-condensed tracking-widest text-emerald-400">
                        DONE
                      </span>
                    </div>
                  ) : (
                    /* Big Primary Launch/Start Button for Active and Ready Days */
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className={`w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-1.5 shadow-lg apple-press ${
                        isActive
                          ? `${theme.buttonBg} shadow-md`
                          : 'bg-gym-primary text-slate-950 hover:opacity-90 border border-gym-primary font-black'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current shrink-0" />
                      <span>{isActive ? 'START WORKOUT' : 'LAUNCH WORKOUT'}</span>
                    </button>
                  )
                ) : (
                  <div className="py-2.5 text-center text-xs font-mono font-black text-gym-muted bg-gym-bg rounded-xl border border-gym-border flex items-center justify-center gap-1.5 shadow-sm">
                    <Moon className="h-3.5 w-3.5 text-gym-muted shrink-0" />
                    <span>Active Recovery & Rest</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};














