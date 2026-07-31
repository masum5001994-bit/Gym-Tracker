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
  bg: 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950/40',
  border: 'border-indigo-500/70 hover:border-indigo-400',
  activeRing: 'ring-2 ring-indigo-400/50 shadow-indigo-500/20',
  badgeBg: 'bg-indigo-400 text-slate-950 border-indigo-300',
  titleColor: 'text-indigo-400',
  buttonBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
  tagColor: 'text-indigo-300',
};

const WORKOUT_DAY_THEMES = [
  // Day 1 (Workout): Deep Space Emerald
  {
    bg: 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/40',
    border: 'border-emerald-500/80 hover:border-emerald-400',
    activeRing: 'ring-2 ring-emerald-500/60 shadow-emerald-500/30',
    badgeBg: 'bg-emerald-500 text-slate-950 font-black border-emerald-400',
    titleColor: 'text-emerald-400',
    buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 font-black shadow-md shadow-emerald-500/30',
    tagColor: 'text-emerald-300',
  },
  // Day 2 (Workout): Electric Cyan
  {
    bg: 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-sky-950/40',
    border: 'border-cyan-400/80 hover:border-cyan-300',
    activeRing: 'ring-2 ring-cyan-400/50 shadow-cyan-400/20',
    badgeBg: 'bg-cyan-400 text-slate-950 border-cyan-300',
    titleColor: 'text-cyan-400',
    buttonBg: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    tagColor: 'text-cyan-300',
  },
  // Day 4 (Workout): Hyper Teal
  {
    bg: 'bg-gradient-to-br from-teal-950/90 via-slate-900 to-emerald-950/40',
    border: 'border-teal-400/80 hover:border-teal-300',
    activeRing: 'ring-2 ring-teal-400/50 shadow-teal-400/20',
    badgeBg: 'bg-teal-400 text-slate-950 border-teal-300',
    titleColor: 'text-teal-400',
    buttonBg: 'bg-teal-400 text-slate-950 hover:bg-teal-300',
    tagColor: 'text-teal-300',
  },
  // Day 5 (Workout): Solar Amber
  {
    bg: 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/40',
    border: 'border-amber-400/80 hover:border-amber-300',
    activeRing: 'ring-2 ring-amber-400/50 shadow-amber-400/20',
    badgeBg: 'bg-amber-400 text-slate-950 border-amber-300',
    titleColor: 'text-amber-400',
    buttonBg: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    tagColor: 'text-amber-300',
  },
  // Day 6 (Workout): Electric Cyan
  {
    bg: 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-teal-950/40',
    border: 'border-cyan-400/80 hover:border-cyan-300',
    activeRing: 'ring-2 ring-cyan-400/50 shadow-cyan-400/20',
    badgeBg: 'bg-cyan-400 text-slate-950 border-cyan-300',
    titleColor: 'text-cyan-400',
    buttonBg: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    tagColor: 'text-cyan-300',
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
    <div className="w-full rounded-3xl glass-panel p-4 sm:p-6 border-2 border-amber-400/40 shadow-2xl shadow-amber-400/10 space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40">
      {/* HERO TEXT HEADER */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 border-2 border-amber-400/50 text-amber-400 shadow-md shrink-0">
              <Calendar className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              {/* HERO TEXT */}
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-amber-400 font-condensed tracking-wider leading-none apple-display-title">
                  7-DAY WORKOUT SCHEDULE
                </h1>
                <span className="text-xs font-black text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-lg font-mono shrink-0 shadow-sm">
                  WEEK {weekNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-bold pt-1">
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
              className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-xl border border-amber-400/40 uppercase tracking-wider font-condensed transition apple-press shadow-sm"
              title="Rename Days & Custom Exercises"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Customize</span>
            </button>

            {(completedWorkouts.length > 0 || completedDayNums.length > 0) && (
              <button
                onClick={handleResetLogs}
                className="flex items-center gap-1.5 text-xs font-black text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl border border-rose-500/40 uppercase tracking-wider font-condensed transition apple-press shadow-sm"
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
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-100 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              {daysSinceLastWorkout} days idle! Next: <strong className="underline text-amber-300">{activeDay.title}</strong>.
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

      {/* CARDS VIEW FOR ALL DAYS (UNIFIED REST DAY THEME & DISTINCT WORKOUT THEMES) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {cycleDays.map((item, idx) => {
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
              className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border-2 transition-all cursor-pointer apple-press shadow-lg space-y-2.5 flex flex-col justify-between ${theme.bg} ${theme.border} ${
                isActive ? theme.activeRing : ''
              }`}
            >
              {/* Day Card Header */}
              <div className="flex flex-col gap-1.5 border-b border-slate-800/80 pb-2">
                <div className="flex items-center justify-between gap-2">
                  {/* HERO DAY BADGE */}
                  <span
                    className={`text-xs sm:text-sm font-black uppercase font-mono px-3 py-1 rounded-xl border-2 shrink-0 shadow-md ${
                      isActive
                        ? `${theme.badgeBg} font-extrabold ring-2 ring-white/30`
                        : isPast
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                        : `${theme.badgeBg} opacity-90`
                    }`}
                  >
                    {item.dayLabel}
                  </span>

                  {/* Status Pill / Top Right Action */}
                  {isActive && item.type === 'workout' ? (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2 py-0.5 rounded-lg shrink-0 shadow-md">
                      ACTIVE NOW
                    </span>
                  ) : isPast ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('light');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-amber-300 font-condensed flex items-center gap-1 shrink-0 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-800 transition apple-press"
                      title="Re-log this workout session"
                    >
                      <RotateCcw className="h-3 w-3 text-slate-400" />
                      <span>Re-log</span>
                    </button>
                  ) : item.type === 'rest' ? (
                    <span className="text-xs font-extrabold text-indigo-300 font-mono flex items-center gap-1 shrink-0 bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-400/40">
                      <Moon className="h-3.5 w-3.5 text-indigo-300" /> REST
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 font-mono shrink-0">READY</span>
                  )}
                </div>

                {/* HERO ROUTINE TITLE & ENHANCED EXERCISE DESCRIPTION */}
                <div className="min-w-0 pt-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h3 className={`text-base sm:text-xl font-black uppercase tracking-wide font-condensed leading-tight apple-display-title ${theme.titleColor}`}>
                      {item.title}
                    </h3>
                    {item.exerciseCount && (
                      <span className="text-[10px] sm:text-xs font-black uppercase font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                        {item.exerciseCount} EXERCISES • ~{item.estimatedMinutes || 45}M
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 font-extrabold leading-snug">
                    {item.focus}
                  </p>
                </div>
              </div>



              {/* Action Area inside Card */}
              <div className="pt-1">
                {item.type === 'workout' ? (
                  isPast ? (
                    /* Single Prominent Big DONE Banner for Completed Days */
                    <div className="py-2.5 sm:py-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/60 text-emerald-300 flex items-center justify-center gap-2 shadow-inner">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" />
                      <span className="text-base sm:text-lg font-black uppercase font-condensed tracking-widest text-emerald-300">
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
                          : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current shrink-0" />
                      <span>{isActive ? 'START WORKOUT' : 'LAUNCH WORKOUT'}</span>
                    </button>
                  )
                ) : (
                  <div className="py-2 text-center text-xs font-mono font-black text-indigo-300 bg-indigo-950/60 rounded-xl border border-indigo-500/40 flex items-center justify-center gap-1.5 shadow-sm">
                    <Moon className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
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













