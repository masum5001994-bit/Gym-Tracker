import React, { useEffect, useState } from 'react';
import { Calendar, Moon, Play, AlertCircle, RotateCcw, Edit3, Dumbbell, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { WorkoutLog } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import { getCustomCycleDays, CustomCycleDay } from '../utils/cycleCustomizer';

export const WeeklyScheduleCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [cycleDays, setCycleDays] = useState<CustomCycleDay[]>(getCustomCycleDays());

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
    };

    window.addEventListener('cycle_days_updated', handleUpdate);
    return () => window.removeEventListener('cycle_days_updated', handleUpdate);
  }, [user]);

  const handleResetLogs = async () => {
    if (window.confirm('Reset all logged workout sessions? This will uncomplete Day 1 and reset your cycle.')) {
      triggerHaptic('warning');
      await api.clearAllWorkouts(user?.uid);
      setWorkoutLogs([]);
    }
  };

  const completedCount = workoutLogs.length;
  const currentCycleIndex = completedCount % 7;
  const activeDay = cycleDays[currentCycleIndex];

  let daysSinceLastWorkout = 0;
  let isMissed = false;

  if (workoutLogs.length > 0) {
    const lastDate = new Date(workoutLogs[0].date);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    daysSinceLastWorkout = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (daysSinceLastWorkout >= 2) {
      isMissed = true;
    }
  }

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
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-amber-400 font-condensed tracking-wider leading-none apple-display-title">
                7-DAY WORKOUT SCHEDULE
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-bold pt-1">
                5 Science Workouts • 2 Active Rest Days
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

            {workoutLogs.length > 0 && (
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

      {/* CARDS VIEW FOR ALL DAYS (Day 1 through Day 7 - 2 COLUMNS LAYOUT) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {cycleDays.map((item, idx) => {
          const isActive = item.dayNum === activeDay.dayNum;
          const isPast = idx < currentCycleIndex;

          return (
            <div
              key={item.dayLabel}
              onClick={() => {
                triggerHaptic('light');
                if (item.type === 'workout') {
                  navigate(`/workout/${item.routineId || 'custom-session'}`);
                }
              }}
              className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 transition-all cursor-pointer apple-press shadow-lg space-y-2.5 flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900/95 border-amber-400 shadow-amber-400/20 ring-2 ring-amber-400/30'
                  : isPast
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-slate-700'
                  : item.type === 'rest'
                  ? 'bg-slate-950/60 border-slate-900/80 hover:border-slate-800'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-amber-400/50'
              }`}
            >
              {/* Day Card Header - HERO DAY & HERO TITLE */}
              <div className="flex flex-col gap-1.5 border-b border-slate-800/80 pb-2">
                <div className="flex items-center justify-between gap-2">
                  {/* HERO DAY BADGE */}
                  <span
                    className={`text-xs sm:text-sm font-black uppercase font-mono px-3 py-1 rounded-xl border-2 shrink-0 shadow-md ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold ring-2 ring-amber-400/40'
                        : isPast
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {item.dayLabel}
                  </span>

                  {/* Status Pill */}
                  {isActive && item.type === 'workout' ? (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2.5 py-1 rounded-lg shrink-0 shadow-md">
                      ACTIVE NOW
                    </span>
                  ) : isPast ? (
                    <span className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" /> DONE
                    </span>
                  ) : item.type === 'rest' ? (
                    <span className="text-xs font-extrabold text-amber-400 font-mono flex items-center gap-1 shrink-0 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      <Moon className="h-3.5 w-3.5" /> REST
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 font-mono shrink-0">READY</span>
                  )}
                </div>

                {/* HERO ROUTINE TITLE */}
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm sm:text-lg font-black text-amber-400 uppercase tracking-wide font-condensed leading-tight apple-display-title">
                    {item.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 font-bold truncate">
                    {item.focus}
                  </p>
                </div>
              </div>


              {/* Exercises List inside Day Card */}
              <div className="space-y-1 bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-amber-400 font-black uppercase font-condensed">
                  <span className="flex items-center gap-1 truncate">
                    <Dumbbell className="h-3 w-3 shrink-0" />
                    {item.type === 'workout' ? `${item.exerciseCount || item.exercisePreview.length} Movements` : 'Recovery Plan'}
                  </span>
                  {item.estimatedMinutes && <span className="shrink-0">⏱ ~{item.estimatedMinutes}m</span>}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 font-mono leading-tight line-clamp-2">
                  {item.exercisePreview.join(' • ')}
                </p>
              </div>

              {/* Action Button inside Card */}
              <div className="pt-0.5">
                {item.type === 'workout' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('medium');
                      navigate(`/workout/${item.routineId || 'custom-session'}`);
                    }}
                    className={`w-full py-1.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-1.5 shadow-lg apple-press ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                        : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <Play className="h-3 w-3 fill-current shrink-0" />
                    <span>{isActive ? 'START' : isPast ? 'RE-LOG' : 'START'}</span>
                  </button>
                ) : (
                  <div className="py-1.5 text-center text-[10px] sm:text-xs font-mono font-bold text-slate-400 bg-slate-950/50 rounded-xl border border-slate-900 flex items-center justify-center gap-1">
                    <Moon className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>Rest Day</span>
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











