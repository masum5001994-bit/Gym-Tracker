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
    <div className="w-full rounded-3xl glass-panel-impeccable p-5 sm:p-6 border border-gym-border shadow-2xl text-gym-text space-y-4">
      <div className="flex items-center justify-between border-b border-gym-border pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gym-primary/20 border border-gym-primary/50 text-gym-primary shadow-md shrink-0">
            <Trophy className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-gym-primary font-condensed tracking-wider leading-none apple-display-title">
              PR HALL OF FAME
            </h2>
            <p className="text-xs text-gym-muted font-bold pt-0.5">All-Time Personal Records & Estimated 1RM Bests</p>
          </div>
        </div>
        <span className="text-xs font-black text-slate-950 bg-gym-secondary px-2.5 py-1 rounded-lg font-mono shadow-sm border border-gym-secondary">
          {prs.length} RECORDS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prs.slice(0, 6).map((pr) => (
          <div
            key={pr.exerciseName}
            className="p-4 rounded-2xl bg-gym-bg border border-gym-border hover:border-gym-primary/50 space-y-2.5 transition shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-gym-primary font-condensed tracking-wide truncate">
                {pr.exerciseName}
              </span>
              <span className="text-xs font-mono font-bold text-gym-secondary bg-gym-secondary/15 px-2 py-0.5 rounded-md border border-gym-secondary/30 shrink-0">
                1RM: {pr.estimated1RM} KG
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-gym-text font-mono">{pr.maxWeightKg} KG</span>
                <span className="text-xs text-gym-muted font-bold">× {pr.maxReps} reps</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gym-muted font-mono font-bold">
                <Calendar className="h-3 w-3 text-gym-secondary" />
                {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

