import React from 'react';
import { Flame, TrendingUp, Trophy } from 'lucide-react';

interface DeltaBadgeProps {
  currentWeightKg: number;
  currentReps: number;
  previousWeightKg?: number;
  previousReps?: number;
  isPR?: boolean;
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({
  currentWeightKg,
  currentReps,
  previousWeightKg,
  previousReps,
  isPR,
}) => {
  if (isPR) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse shadow-sm">
        <Trophy className="h-3 w-3 text-amber-400" />
        <span>PR!</span>
      </span>
    );
  }

  if (previousWeightKg === undefined || previousReps === undefined) {
    return null;
  }

  const weightDelta = Math.round((currentWeightKg - previousWeightKg) * 10) / 10;
  const repDelta = currentReps - previousReps;

  if (weightDelta > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/30">
        <Flame className="h-3 w-3 text-orange-400 fill-orange-400/20" />
        <span>+{weightDelta} kg</span>
      </span>
    );
  }

  if (repDelta > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
        <TrendingUp className="h-3 w-3 text-emerald-400" />
        <span>+{repDelta} reps</span>
      </span>
    );
  }

  return null;
};
