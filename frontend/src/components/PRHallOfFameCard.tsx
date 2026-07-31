import React from 'react';
import { Trophy, Calendar, Dumbbell, Flame, TrendingUp } from 'lucide-react';
import { WorkoutLog } from '../types';
import { extractPersonalRecords, PersonalRecordItem } from '../utils/prCalculator';

interface PRHallOfFameCardProps {
  workoutLogs: WorkoutLog[];
}

export const PRHallOfFameCard: React.FC<PRHallOfFameCardProps> = ({ workoutLogs }) => {
  const prs = extractPersonalRecords(workoutLogs);

  if (prs.length === 0) return null;

  return (
    <div className="w-full rounded-3xl glass-panel p-5 sm:p-6 border-2 border-amber-400/40 shadow-xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-400 shadow-md">
            <Trophy className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-amber-400 font-condensed tracking-wider leading-none">
              PR HALL OF FAME
            </h2>
            <p className="text-xs text-slate-300 pt-0.5">All-Time Personal Records & Estimated 1RM Bests</p>
          </div>
        </div>
        <span className="text-xs font-black text-slate-950 bg-amber-400 px-2.5 py-1 rounded-lg font-mono shadow-sm">
          {prs.length} RECORDS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prs.slice(0, 6).map((pr, idx) => (
          <div
            key={pr.exerciseName}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2 hover:border-amber-400/40 transition shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-amber-400 font-condensed tracking-wide truncate">
                {pr.exerciseName}
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30 shrink-0">
                1RM: {pr.estimated1RM} KG
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-100 font-mono">{pr.maxWeightKg} KG</span>
                <span className="text-xs text-slate-400 font-bold">× {pr.maxReps} reps</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Calendar className="h-3 w-3 text-cyan-400" />
                {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
