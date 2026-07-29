import React, { useEffect, useState } from 'react';
import { Calendar, Moon, Play, AlertCircle, CheckCircle2, Dumbbell, RotateCcw, Flame, Clock, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { WorkoutLog } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';

interface CycleDay {
  dayNum: number;
  dayLabel: string;
  type: 'workout' | 'rest';
  routineId?: string;
  title: string;
  focus: string;
  exerciseCount?: number;
  estimatedMinutes?: number;
  tags: string[];
  exercisePreview: string[];
}

export const WeeklyScheduleCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const fetchLogs = () => {
    api
      .getWorkouts(user?.uid)
      .then(setWorkoutLogs)
      .catch(console.error);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleResetLogs = async () => {
    if (window.confirm('Reset all logged workout sessions? This will uncomplete Day 1 and reset your cycle.')) {
      triggerHaptic('warning');
      await api.clearAllWorkouts(user?.uid);
      setWorkoutLogs([]);
    }
  };

  const cycleDays: CycleDay[] = [
    {
      dayNum: 1,
      dayLabel: 'DAY 1',
      type: 'workout',
      routineId: 'routine-upper-body',
      title: 'Upper Body',
      focus: 'Chest, Back & Shoulders',
      exerciseCount: 6,
      estimatedMinutes: 50,
      tags: ['Chest', 'Back', 'Delts'],
      exercisePreview: ['Incline DB Press', 'Lat Pulldown', 'Incline Fly', 'Chest Supported Row'],
    },
    {
      dayNum: 2,
      dayLabel: 'DAY 2',
      type: 'workout',
      routineId: 'routine-lower-body-1',
      title: 'Lower Body 1',
      focus: 'Quad-Focused',
      exerciseCount: 5,
      estimatedMinutes: 45,
      tags: ['Quads', 'Hamstrings', 'Calves'],
      exercisePreview: ['Barbell Squat', 'Romanian Deadlift', 'Seated Leg Ext', 'Walking Lunges'],
    },
    {
      dayNum: 3,
      dayLabel: 'DAY 3',
      type: 'rest',
      title: 'REST DAY',
      focus: 'Active Recovery & Mobility',
      tags: ['Active Recovery'],
      exercisePreview: ['Light Walking', 'Foam Rolling', 'Mobility Drills'],
    },
    {
      dayNum: 4,
      dayLabel: 'DAY 4',
      type: 'workout',
      routineId: 'routine-push',
      title: 'Push Workout',
      focus: 'Chest, Delts & Triceps',
      exerciseCount: 6,
      estimatedMinutes: 50,
      tags: ['Chest', 'Delts', 'Triceps'],
      exercisePreview: ['Overhead Press', 'Incline Press', 'Cable Flyes', 'Lateral Raises'],
    },
    {
      dayNum: 5,
      dayLabel: 'DAY 5',
      type: 'workout',
      routineId: 'routine-pull',
      title: 'Pull Workout',
      focus: 'Lat Back & Biceps',
      exerciseCount: 6,
      estimatedMinutes: 50,
      tags: ['Back', 'Rear Delts', 'Biceps'],
      exercisePreview: ['Deadlift', 'Lat Pulldown', 'DB Rows', 'Incline Curls'],
    },
    {
      dayNum: 6,
      dayLabel: 'DAY 6',
      type: 'workout',
      routineId: 'routine-lower-body-2',
      title: 'Lower Body 2',
      focus: 'Glutes & Posterior Chain',
      exerciseCount: 5,
      estimatedMinutes: 45,
      tags: ['Glutes', 'Hamstrings', 'Quads'],
      exercisePreview: ['Barbell Squat', 'Hip Thrust', 'Split Squat', 'Leg Curls'],
    },
    {
      dayNum: 7,
      dayLabel: 'DAY 7',
      type: 'rest',
      title: 'REST DAY',
      focus: 'Full CNS Reset & Recovery',
      tags: ['CNS Reset'],
      exercisePreview: ['Sleep & Fiber Supercompensation'],
    },
  ];

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
    <div className="rounded-3xl glass-panel p-4 sm:p-6 border border-blue-900/60 shadow-2xl space-y-4 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30">
      {/* Card Header with Mobile Touch Target Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-amber-400 shrink-0">
            <Calendar className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase text-slate-100 font-condensed tracking-wide apple-display-title">
              WEEKLY WORKOUT SCHEDULE
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold">5 Workout Days • 2 Rest Days</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
          {workoutLogs.length > 0 && (
            <button
              onClick={handleResetLogs}
              className="flex items-center gap-1.5 text-xs font-black text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 uppercase tracking-wider font-condensed transition apple-press min-h-[36px]"
              title="Reset All Logged Workouts"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Progress</span>
            </button>
          )}

          <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30 uppercase tracking-wider font-condensed">
            Day {activeDay.dayNum} Active
          </span>
        </div>
      </div>

      {/* Missed Day Alert */}
      {isMissed && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-xs font-bold truncate">
              {daysSinceLastWorkout}d since last workout! Next: <span className="underline text-amber-300">{activeDay.title}</span>.
            </span>
          </div>
          {activeDay.type === 'workout' && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                navigate(`/workout/${activeDay.routineId || 'custom-session'}`);
              }}
              className="rounded-xl bg-rose-500 text-slate-950 px-3.5 py-1.5 text-xs font-black uppercase font-condensed tracking-wider shrink-0 apple-press shadow"
            >
              Resume
            </button>
          )}
        </div>
      )}



      {/* Rich iOS Workout Widget Grid (Zero Empty Space) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
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
              className={`flex flex-col justify-between rounded-2xl p-4 transition-all cursor-pointer border apple-press shadow-md ${
                isActive
                  ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/80 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-400/10'
                  : isPast
                  ? 'bg-slate-900/90 border-slate-800 opacity-90 hover:opacity-100 hover:border-blue-500'
                  : item.type === 'rest'
                  ? 'bg-slate-950/80 border-slate-800/80 hover:border-amber-400/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase font-mono px-2 py-0.5 rounded-lg border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}>
                    {item.dayLabel}
                  </span>

                  {/* Muscle Category Chips */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[9px] font-bold text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {isPast ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                ) : item.type === 'rest' ? (
                  <Moon className="h-4 w-4 text-amber-400 opacity-90" />
                ) : (
                  <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-blue-500'}`}></div>
                )}
              </div>

              {/* Title & Stats */}
              <div className="my-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight font-condensed apple-display-title">
                    {item.title}
                  </h4>
                  {item.estimatedMinutes && (
                    <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{item.estimatedMinutes}m
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-semibold truncate leading-snug">
                  {item.focus}
                </p>
              </div>

              {/* Rich Exercise Preview Box */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 my-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-amber-400" />
                  {item.type === 'workout' ? `${item.exerciseCount} Key Movements` : 'Recovery Strategy'}
                </span>
                <p className="text-[11px] text-slate-300 font-mono font-medium line-clamp-2 leading-tight">
                  {item.exercisePreview.join(' • ')}
                </p>
              </div>

              {/* Action Bar */}
              <div className="pt-2">
                {isActive ? (
                  <button className="w-full text-center py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider font-condensed shadow-md flex items-center justify-center gap-1.5">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{item.type === 'workout' ? 'START WORKOUT' : 'REST & RECOVER'}</span>
                  </button>
                ) : isPast ? (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      COMPLETED ✓
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Reset ${item.dayLabel} (${item.title}) back to active status?`)) {
                          triggerHaptic('warning');
                          const latestLog = workoutLogs[0];
                          if (latestLog) {
                            await api.deleteWorkout(latestLog.id, user?.uid);
                            fetchLogs();
                          }
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] font-black text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-2.5 py-1 rounded-xl uppercase tracking-wider font-condensed transition apple-press shrink-0 shadow-sm"
                      title="Uncomplete Day / Mistake Finish Reset"
                    >
                      <RotateCcw className="h-3 w-3 text-rose-400" />
                      <span>Reset Day</span>
                    </button>
                  </div>
                ) : (
                  <span className="block w-full text-center py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {item.type === 'workout' ? 'TAP TO START' : 'REST'}
                  </span>
                )}

              </div>
            </div>
          );

        })}
      </div>
    </div>
  );
};






