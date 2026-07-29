export interface SetPerformance {
  setNum: number;
  weightKg: number;
  reps: number;
  completed?: boolean;
}

export interface DeltaResult {
  weightDeltaKg: number;
  repDelta: number;
  isPR: boolean;
  estimated1RM: number;
}

/**
 * Calculates estimated 1 Rep Max (1RM) using the standard Epley Formula:
 * 1RM = weightKg * (1 + reps / 30)
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  const oneRM = weightKg * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Evaluates whether a logged set performance constitutes a personal record (PR)
 * based on previous historical maximum weight and 1RM.
 */
export function evaluatePRStatus(
  weightKg: number,
  reps: number,
  historicalMaxWeightKg: number,
  historicalMax1RM: number
): { isPR: boolean; estimated1RM: number } {
  const current1RM = calculateEpley1RM(weightKg, reps);
  const isPR = weightKg > historicalMaxWeightKg || current1RM > historicalMax1RM;
  return { isPR, estimated1RM: current1RM };
}

/**
 * Calculates progressive overload deltas (+kg, +reps) between current set and previous set performance.
 */
export function calculateSetDelta(
  current: SetPerformance,
  previous?: SetPerformance
): { weightDeltaKg: number; repDelta: number } {
  if (!previous) {
    return { weightDeltaKg: 0, repDelta: 0 };
  }

  const weightDeltaKg = Math.round((current.weightKg - previous.weightKg) * 10) / 10;
  const repDelta = current.reps - previous.reps;

  return { weightDeltaKg, repDelta };
}

export const TARGET_WEEKLY_SETS_PER_MUSCLE = 14;

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Triceps',
  'Biceps',
  'Calves',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export interface VolumeMatrixEntry {
  category: MuscleGroup;
  completedSets: number;
  targetSets: number;
  percentage: number;
  status: 'Low' | 'Optimal' | 'High';
}

/**
 * Evaluates weekly set volume for each muscle group against the BWS 14 sets/week target split.
 */
export function calculateVolumeMatrix(
  setCountsByCategory: Record<string, number>
): VolumeMatrixEntry[] {
  return MUSCLE_GROUPS.map((category) => {
    const completedSets = setCountsByCategory[category] || 0;
    const percentage = Math.min(Math.round((completedSets / TARGET_WEEKLY_SETS_PER_MUSCLE) * 100), 200);

    let status: 'Low' | 'Optimal' | 'High' = 'Low';
    if (completedSets >= 12 && completedSets <= 16) {
      status = 'Optimal';
    } else if (completedSets > 16) {
      status = 'High';
    }

    return {
      category,
      completedSets,
      targetSets: TARGET_WEEKLY_SETS_PER_MUSCLE,
      percentage,
      status,
    };
  });
}
