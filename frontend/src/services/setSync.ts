import { LiveExerciseLog } from '../types';

export interface ActiveDraftPayload {
  routineId: string;
  updatedAt: string;
  completedSetsCount: number;
  exerciseLogs: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      setNum: number;
      weightKg: number;
      reps: number;
      completed: boolean;
      effort?: string;
      isPR?: boolean;
    }[];
  }[];
}

export function prepareActiveDraftPayload(routineId: string, logs: LiveExerciseLog[]): ActiveDraftPayload {
  let completedSetsCount = 0;

  const exerciseLogs = logs.map((el) => {
    const completedSets = el.sets.filter((s) => s.completed);
    completedSetsCount += completedSets.length;

    return {
      exerciseId: el.exerciseId,
      exerciseName: el.exerciseName,
      sets: completedSets.map((s) => ({
        setNum: s.setNum,
        weightKg: s.weightKg || 0,
        reps: s.reps || 0,
        completed: true,
        effort: s.effort,
        isPR: s.isPR,
      })),
    };
  });

  return {
    routineId,
    updatedAt: new Date().toISOString(),
    completedSetsCount,
    exerciseLogs,
  };
}
