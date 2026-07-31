import { WorkoutLog } from '../types';

export interface PersonalRecordItem {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxReps: number;
  estimated1RM: number;
  date: string;
  routineTitle: string;
}

export function extractPersonalRecords(logs: WorkoutLog[]): PersonalRecordItem[] {
  const prMap = new Map<string, PersonalRecordItem>();

  logs.forEach((w) => {
    if (!w || (w as any).deleted) return;

    w.exerciseLogs?.forEach((el) => {
      if (!el || !el.sets) return;

      el.sets.forEach((s) => {
        if (!s.completed || !s.weightKg) return;

        const weight = s.weightKg;
        const reps = s.reps || 0;
        const est1RM = reps > 0 ? Math.round(weight * (1 + reps / 30) * 10) / 10 : weight;

        const existing = prMap.get(el.exerciseName);

        if (!existing || weight > existing.maxWeightKg || (weight === existing.maxWeightKg && reps > existing.maxReps)) {
          prMap.set(el.exerciseName, {
            exerciseId: el.exerciseId || el.id || el.exerciseName,
            exerciseName: el.exerciseName,
            maxWeightKg: weight,
            maxReps: reps,
            estimated1RM: est1RM,
            date: w.date,
            routineTitle: w.routineTitle,
          });
        }
      });
    });
  });

  return Array.from(prMap.values()).sort((a, b) => b.maxWeightKg - a.maxWeightKg);
}
