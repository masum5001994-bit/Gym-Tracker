import React, { useEffect, useState } from 'react';
import { Calendar, Moon, Play, AlertCircle, RotateCcw, Layers, CheckCircle2 } from 'lucide-react';
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
      title: 'Upper Body',
      focus: 'Chest, Back & Shoulders',
      exerciseCount: 6,
      estimatedMinutes: 50,
      tags: ['Chest', 'Back'],
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
      tags: ['Quads', 'Calves'],
      exercisePreview: ['Barbell Squat', 'Romanian Deadlift', 'Seated Leg Ext', 'Walking Lunges'],
    },
    {
      dayNum: 3,
      dayLabel: 'DAY 3',
      type: 'rest',
      title: 'REST DAY',
      focus: 'Active Recovery & Mobility',
      tags: ['Recovery'],
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
      tags: ['Chest', 'Delts'],
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
      tags: ['Back', 'Biceps'],
      exercisePreview: ['Deadlift', 'Lat Pulldown', 'DB Rows', 'Incline Curls'],
    },
    {
      dayNum: 6,
      dayLabel: 'DAY 6',
      type: 'workout',
      routineId: 'routine-lower-body-2',
      title: 'Lower Body 2',
      focus: 'Glutes & Hamstrings',
      exerciseCount: 5,
      estimatedMinutes: 45,
      tags: ['Glutes', 'Hamstrings'],
      exercisePreview: ['Barbell Squat', 'Hip Thrust', 'Split Squat', 'Leg Curls'],
    },
    {
      dayNum: 7,
      dayLabel: 'DAY 7',
      type: 'rest',
      title: 'REST DAY',
      focus: 'Full CNS Reset',
      tags: ['CNS Reset'],
      exercisePreview: ['Sleep & Supercompensation'],
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
    <div className="w-full rounded-3xl glass-panel p-3 sm:p-4 border border-blue-900/60 shadow-2xl space-y-2.5 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
          <h2 className="text-xs sm:text-sm font-black uppercase text-slate-100 font-condensed tracking-wide truncate apple-display-title">
            7-DAY WORKOUT SCHEDULE
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {workoutLogs.length > 0 && (
            <button
              onClick={handleResetLogs}
              className="flex items-center gap-1 text-[9px] font-black text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30 uppercase tracking-wider font-condensed transition apple-press"
              title="Reset Cycle Progress"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-[10px] font-black text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-lg font-mono">
            DAY {activeDay.dayNum} ACTIVE
          </span>
        </div>
      </div>

      {/* Missed Day Alert */}
      {isMissed && (
        <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{daysSinceLastWorkout}d idle! Next: {activeDay.title}.</span>
          </div>
          {activeDay.type === 'workout' && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                navigate(`/workout/${activeDay.routineId || 'custom-session'}`);
              }}
              className="rounded-lg bg-rose-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 apple-press"
            >
              Resume
            </button>
          )}
        </div>
      )}

      {/* Ultra-Compact 7-Day Rows - All 7 Days Fit on One Screen */}
      <div className="space-y-1">
        {cycleDays.map((item, idx) => {
          const isActive = item.dayNum === activeDay.dayNum;
          const isPast = idx < currentCycleIndex;
          const isExpanded = expandedDayIndex === idx;

          return (
            <div
              key={item.dayLabel}
              className={`rounded-xl transition-all border apple-press ${
                isActive
                  ? 'bg-slate-900 border-amber-400/90 shadow-sm shadow-amber-400/20'
                  : isPast
                  ? 'bg-slate-950/80 border-slate-800/80'
                  : item.type === 'rest'
                  ? 'bg-slate-950/40 border-slate-900/60'
                  : 'bg-slate-950/60 border-slate-800/60'
              }`}
            >
              {/* Single Compact Row */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  if (item.type === 'workout') {
                    navigate(`/workout/${item.routineId || 'custom-session'}`);
                  }
                }}
                className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer select-none"
              >
                {/* Left: Day Badge + Title + Tag */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`text-[11px] font-black uppercase font-mono px-2 py-0.5 rounded-lg border shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-sm'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {item.dayLabel}
                  </span>

                  <div className="min-w-0 flex-1 flex items-baseline gap-2">
                    <h4 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-tight font-condensed truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold truncate hidden sm:inline">
                      • {item.focus}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isActive && item.type === 'workout' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-amber-400 text-slate-950 px-3 py-1 text-xs font-black uppercase font-condensed shadow-sm apple-press"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>START</span>
                    </button>
                  ) : isPast ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-400 font-mono">✓ DONE</span>
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
                        className="flex items-center gap-1 text-[10px] font-black text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-lg uppercase font-condensed apple-press"
                        title="Reset Day Status"
                      >
                        <RotateCcw className="h-2.5 w-2.5 text-rose-400" />
                        <span>Reset</span>
                      </button>
                    </div>
                  ) : item.type === 'rest' ? (
                    <span className="text-xs font-extrabold text-slate-400 font-mono flex items-center gap-1">
                      <Moon className="h-3 w-3 text-amber-400" /> REST
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 font-mono">READY</span>
                  )}

                  {/* Drawer Toggle */}
                  <button
                    onClick={(e) => toggleDayExpansion(idx, e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-100 apple-press"
                    title={isExpanded ? 'Collapse Details' : 'Expand Movements'}
                  >
                    <Layers className={`h-3.5 w-3.5 ${isExpanded ? 'text-amber-400' : 'text-slate-500'}`} />
                  </button>
                </div>
              </div>


              {/* Drawer preview details */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-800/80 space-y-1.5 text-left text-[11px]">
                  <p className="text-slate-300 font-mono leading-tight bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    {item.exercisePreview.join(' • ')}
                  </p>
                  {item.type === 'workout' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        navigate(`/workout/${item.routineId || 'custom-session'}`);
                      }}
                      className="w-full text-center py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider font-condensed shadow apple-press"
                    >
                      <Play className="h-3 w-3 fill-current inline mr-1" />
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










