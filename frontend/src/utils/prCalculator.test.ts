import { describe, it, expect } from 'vitest';
import { extractPersonalRecords } from './prCalculator';
import { WorkoutLog } from '../types';

describe('prCalculator', () => {
  it('extracts top PR per exercise across all workout logs', () => {
    const mockLogs: WorkoutLog[] = [
      {
        id: '1',
        routineId: 'routine-1',
        routineTitle: 'Upper Body',
        date: '2026-07-20T10:00:00.000Z',
        durationMinutes: 45,
        totalVolumeKg: 1000,
        prCount: 1,
        exerciseLogs: [
          {
            id: 'ex-bench',
            exerciseId: 'ex-bench',
            exerciseName: 'Barbell Bench Press',
            sets: [
              { setNum: 1, weightKg: 80, reps: 10, completed: true },
              { setNum: 2, weightKg: 90, reps: 5, completed: true, isPR: true },
            ],
          },
        ],
      },
      {
        id: '2',
        routineId: 'routine-1',
        routineTitle: 'Upper Body',
        date: '2026-07-25T10:00:00.000Z',
        durationMinutes: 50,
        totalVolumeKg: 1200,
        prCount: 1,
        exerciseLogs: [
          {
            id: 'ex-bench',
            exerciseId: 'ex-bench',
            exerciseName: 'Barbell Bench Press',
            sets: [
              { setNum: 1, weightKg: 100, reps: 5, completed: true, isPR: true },
            ],
          },
          {
            id: 'ex-squat',
            exerciseId: 'ex-squat',
            exerciseName: 'Barbell Squat',
            sets: [
              { setNum: 1, weightKg: 140, reps: 5, completed: true, isPR: true },
            ],
          },
        ],
      },
    ];

    const prs = extractPersonalRecords(mockLogs);

    expect(prs).toHaveLength(2);
    const benchPR = prs.find((p) => p.exerciseName === 'Barbell Bench Press');
    expect(benchPR?.maxWeightKg).toBe(100);
    expect(benchPR?.maxReps).toBe(5);
    expect(benchPR?.date).toBe('2026-07-25T10:00:00.000Z');

    const squatPR = prs.find((p) => p.exerciseName === 'Barbell Squat');
    expect(squatPR?.maxWeightKg).toBe(140);
  });
});
