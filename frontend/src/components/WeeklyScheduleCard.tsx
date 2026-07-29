import React, { useEffect, useState } from 'react';
import { Calendar, Moon, Play, AlertCircle, RotateCcw, Clock, Layers, Dumbbell, CheckCircle2 } from 'lucide-react';
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
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(null);

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

  const toggleDayExpansion = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('light');
    setExpandedDayIndex((prev) => (prev === idx ? null : idx));
  };

  const cycleDays: CycleDay[] = [
    {
      dayNum: 1,
      dayLabel: 'DAY 1',
      type: 'workout',
      routineId: 'routine-upper-body',
      title: 'Upper Body Power',
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
      focus: 'Quad & Leg Growth',
      exerciseCount: 5,
      estimatedMinutes: 45,
      tags: ['Quads', 'Hamstrings', 'Calves'],
      exercisePreview: ['Barbell Squat', 'Romanian Deadlift', 'Seated Leg Ext', 'Walking Lunges'],
    },
    {
      dayNum: 3,
      dayLabel: 'DAY 3',
      type: 'rest',
      title: 'REST & RECOVERY',
      focus: 'Active Mobility & Fiber Repair',
      tags: ['Active Recovery'],
      exercisePreview: ['Light Walking', 'Foam Rolling', 'Mobility Drills'],
    },
    {
      dayNum: 4,
      dayLabel: 'DAY 4',
      type: 'workout',
      routineId: 'routine-push',
      title: 'Push Hypertrophy',
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
      title: 'Pull Hypertrophy',
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
    <div className="w-full rounded-3xl glass-panel p-5 sm:p-7 border-2 border-amber-400/40 shadow-2xl shadow-amber-400/10 space-y-5 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40">
      {/* Prominent Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-0.5 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-400 shadow-md shrink-0">
            <Calendar className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black uppercase text-slate-100 font-condensed tracking-wide apple-display-title">
              7-DAY WORKOUT CYCLE
            </h2>
            <p className="text-xs sm:text-sm text-amber-400 font-bold">5 Hypertrophy Workouts • 2 Rest Days</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {workoutLogs.length > 0 && (
            <button
              onClick={handleResetLogs}
              className="flex items-center gap-1.5 text-xs font-black text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-3.5 py-2 rounded-xl border border-rose-500/40 uppercase tracking-wider font-condensed transition apple-press shadow-sm min-h-[40px]"
              title="Reset All Logged Workouts"
            >
              <RotateCcw className="h-4 w-4 text-rose-400" />
              <span>Reset Cycle</span>
            </button>
          )}

          <span className="text-xs sm:text-sm font-black text-slate-950 bg-amber-400 px-4 py-2 rounded-xl border border-amber-300 uppercase tracking-wider font-condensed shadow-md">
            Day {activeDay.dayNum} Active
          </span>
        </div>
      </div>

      {/* Missed Day Alert */}
      {isMissed && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-100 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              {daysSinceLastWorkout} days since last session! Next: <strong className="underline text-amber-300">{activeDay.title}</strong>.
            </span>
          </div>
          {activeDay.type === 'workout' && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                navigate(`/workout/${activeDay.routineId || 'custom-session'}`);
              }}
              className="rounded-xl bg-rose-500 text-slate-950 px-4 py-2 text-xs font-black uppercase font-condensed tracking-wider shrink-0 apple-press shadow-md"
            >
              Resume
            </button>
          )}
        </div>
      )}

      {/* Enlarged Full-Screen 7-Day Workout Cards Grid */}
      <div className="space-y-3 pt-1">
        {cycleDays.map((item, idx) => {
          const isActive = item.dayNum === activeDay.dayNum;
          const isPast = idx < currentCycleIndex;
          const isExpanded = expandedDayIndex === idx;

          return (
            <div
              key={item.dayLabel}
              className={`rounded-3xl transition-all border-2 apple-press shadow-md ${
                isActive
                  ? 'bg-slate-900/95 border-amber-400 shadow-amber-400/20 ring-1 ring-amber-400/40'
                  : isPast
                  ? 'bg-slate-950/90 border-slate-800/90'
                  : item.type === 'rest'
                  ? 'bg-slate-950/60 border-slate-900'
                  : 'bg-slate-900/80 border-slate-800/80'
              }`}
            >
              {/* Day Header Bar */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  if (item.type === 'workout') {
                    navigate(`/workout/${item.routineId || 'custom-session'}`);
                  }
                }}
                className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer select-none"
              >
                {/* Left: Larger Day Badge + Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`text-xs sm:text-sm font-black uppercase font-mono px-3 py-1 rounded-xl border-2 shrink-0 shadow-sm ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {item.dayLabel}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-xl font-black text-slate-100 uppercase tracking-wide font-condensed apple-display-title">
                        {item.title}
                      </h4>
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 font-semibold truncate pt-0.5">
                      {item.focus}
                    </p>
                  </div>
                </div>

                {/* Right: Status Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isActive && item.type === 'workout' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 px-4 py-2 text-xs sm:text-sm font-black uppercase font-condensed shadow-lg apple-press hover:bg-amber-300"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>START</span>
                    </button>
                  ) : isPast ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> DONE
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
                        className="flex items-center gap-1 text-xs font-black text-rose-300 bg-rose-500/20 border border-rose-500/40 px-2.5 py-1.5 rounded-xl uppercase font-condensed apple-press shadow-sm"
                        title="Reset Day Status"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                        <span>Reset</span>
                      </button>
                    </div>
                  ) : item.type === 'rest' ? (
                    <span className="text-xs sm:text-sm font-black text-slate-400 font-mono flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Moon className="h-4 w-4 text-amber-400" /> REST
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-black text-slate-500 font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">READY</span>
                  )}

                  {/* Expand Chevron Drawer Toggle */}
                  <button
                    onClick={(e) => toggleDayExpansion(idx, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-100 apple-press bg-slate-900 border border-slate-800"
                    title={isExpanded ? 'Collapse Details' : 'Expand Exercise Preview'}
                  >
                    <Layers className={`h-4 w-4 ${isExpanded ? 'text-amber-400' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Exercise Drawer Details */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-800 space-y-3 animate-fade-in text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black uppercase text-amber-400 font-condensed flex items-center gap-1.5">
                      <Dumbbell className="h-4 w-4" />
                      {item.type === 'workout' ? `${item.exerciseCount} Key Movements` : 'Recovery Plan'}
                    </span>
                    {item.estimatedMinutes && (
                      <span className="font-mono text-cyan-400 font-bold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> ~{item.estimatedMinutes}m duration
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
                    {item.exercisePreview.join(' • ')}
                  </p>

                  {item.type === 'workout' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className="w-full text-center py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-black uppercase font-condensed tracking-wider shadow-xl flex items-center justify-center gap-2 apple-press hover:opacity-95"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>{isPast ? 'RE-LOG WORKOUT' : 'LAUNCH WORKOUT SESSION'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};









