import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Dumbbell, Moon, Play, Sparkles, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WorkoutLog } from '../types';
import { CustomCycleDay } from '../utils/cycleCustomizer';
import { triggerHaptic } from '../utils/haptics';

interface MonthlyCalendarCardProps {
  cycleDays: CustomCycleDay[];
  workoutLogs: WorkoutLog[];
  onSelectDate?: (dateStr: string) => void;
}

export const MonthlyCalendarCard: React.FC<MonthlyCalendarCardProps> = ({
  cycleDays,
  workoutLogs,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    triggerHaptic('medium');
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Calculate calendar grid metrics
  const firstDayOfMonthIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create a log map by YYYY-MM-DD
  const logsByDate: Record<string, WorkoutLog[]> = {};
  workoutLogs.forEach((log) => {
    if (log.date) {
      const dStr = log.date.split('T')[0];
      if (!logsByDate[dStr]) logsByDate[dStr] = [];
      logsByDate[dStr].push(log);
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to map calendar day number to cycle routine day
  const getRoutineForDayNum = (dayNumber: number): CustomCycleDay => {
    if (cycleDays.length === 0) {
      return {
        dayNum: 1,
        dayLabel: 'DAY 1',
        type: 'workout',
        title: 'Full Body Workout',
        focus: 'Chest, Back & Legs',
        tags: ['Workout'],
        exercisePreview: ['Bench Press', 'Squats', 'Rows'],
      };
    }
    const idx = (dayNumber - 1) % cycleDays.length;
    return cycleDays[idx];
  };

  // Get selected day details
  const [selYear, selMonth, selDay] = selectedDateStr.split('-').map(Number);
  const selectedDayNum = selDay || 1;
  const selectedRoutine = getRoutineForDayNum(selectedDayNum);
  const selectedLogs = logsByDate[selectedDateStr] || [];
  const isSelectedCompleted = selectedLogs.length > 0;

  return (
    <div className="w-full rounded-3xl glass-panel-impeccable p-4 sm:p-6 border border-gym-border shadow-2xl space-y-5 text-gym-text">
      
      {/* MONTHLY HEADER & STEPPER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gym-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-md shrink-0">
            <CalendarIcon className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-100 font-condensed tracking-wider leading-none">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={handleToday}
                className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/15 hover:bg-cyan-500/25 px-2 py-0.5 rounded-md border border-cyan-500/30 transition"
              >
                Today
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium pt-1">
              Month-by-Month Master Training Schedule
            </p>
          </div>
        </div>

        {/* MONTH NAVIGATION STEPPER */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 self-end sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Previous Month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-200 px-2">
            {monthNames[month].slice(0, 3)} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Next Month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* DAYS OF WEEK HEADER */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-mono font-black text-slate-400 uppercase tracking-widest py-1 border-b border-slate-800/60">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      {/* MONTHLY CALENDAR DAYS GRID */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Blank offset cells for starting day */}
        {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
          <div
            key={`blank-${i}`}
            className="h-16 sm:h-24 rounded-2xl bg-slate-950/30 border border-slate-900/40 opacity-20 pointer-events-none"
          />
        ))}

        {/* Calendar Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday = dayStr === todayStr;
          const isSelected = dayStr === selectedDateStr;
          const dayLogs = logsByDate[dayStr] || [];
          const isCompleted = dayLogs.length > 0;
          const routine = getRoutineForDayNum(dayNum);
          const isWorkout = routine.type === 'workout';

          return (
            <div
              key={dayStr}
              onClick={() => {
                triggerHaptic('light');
                setSelectedDateStr(dayStr);
              }}
              className={`h-16 sm:h-24 rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer transition relative overflow-hidden border ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/60 shadow-lg'
                  : isToday
                  ? 'border-amber-400/80 bg-amber-950/20 ring-1 ring-amber-400/40'
                  : isCompleted
                  ? 'border-emerald-500/50 bg-emerald-950/30 hover:bg-emerald-950/40'
                  : isWorkout
                  ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Top Row: Day Number & Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full font-mono text-[10px] sm:text-xs font-black flex items-center justify-center ${
                    isToday
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : isWorkout
                      ? 'bg-slate-800 text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {dayNum}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                ) : isWorkout ? (
                  <Dumbbell className="h-3 w-3 text-cyan-400 opacity-60 hidden sm:block" />
                ) : (
                  <Moon className="h-3 w-3 text-slate-600 hidden sm:block" />
                )}
              </div>

              {/* Bottom Content: Routine Title or Completed Badge */}
              <div>
                {isCompleted ? (
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-400 font-mono block truncate">
                      ✓ Done
                    </span>
                    <span className="text-[8px] text-slate-300 font-mono hidden sm:block truncate">
                      {Math.round(dayLogs[0].totalVolumeKg || 0)} kg
                    </span>
                  </div>
                ) : isWorkout ? (
                  <div>
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-200 line-clamp-1">
                      {routine.title}
                    </span>
                    <span className="text-[8px] font-mono text-cyan-400/80 hidden sm:block truncate">
                      {routine.focus}
                    </span>
                  </div>
                ) : (
                  <span className="text-[8px] font-mono text-slate-500 uppercase block truncate">
                    Rest
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED DATE INSPECTOR CARD */}
      <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              Selected Calendar Date
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-100 font-condensed uppercase tracking-wider">
              {new Date(selYear, selMonth - 1, selDay).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
          </div>

          {isSelectedCompleted ? (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completed Log</span>
            </span>
          ) : selectedRoutine.type === 'workout' ? (
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider font-mono">
              Scheduled Workout
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-black uppercase tracking-wider font-mono">
              Rest Day
            </span>
          )}
        </div>

        {/* Selected Day Details */}
        {isSelectedCompleted ? (
          <div className="space-y-2">
            {selectedLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-emerald-400">{log.routineTitle}</h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    ⏱️ {log.durationMinutes || 45} mins
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
                  <span>💪 Total Volume: <strong className="text-amber-400">{Math.round(log.totalVolumeKg || 0)} kg</strong></span>
                  {log.prCount > 0 && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> {log.prCount} PRs!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-slate-100">{selectedRoutine.title}</h4>
              <span className="text-[10px] font-mono text-cyan-400">{selectedRoutine.focus}</span>
            </div>
            {selectedRoutine.exercisePreview.length > 0 && (
              <p className="text-xs text-slate-400 line-clamp-1 font-mono">
                Exercises: {selectedRoutine.exercisePreview.join(' • ')}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        {selectedRoutine.type === 'workout' && (
          <button
            onClick={() => {
              triggerHaptic('medium');
              navigate(`/workout/${selectedRoutine.routineId || 'custom-session'}`);
            }}
            className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg transition flex items-center justify-center gap-1.5 font-condensed"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>
              {isSelectedCompleted ? 'Re-Log Workout Session' : `Start Workout for ${monthNames[selMonth - 1].slice(0, 3)} ${selDay}`}
            </span>
          </button>
        )}
      </div>

    </div>
  );
};
