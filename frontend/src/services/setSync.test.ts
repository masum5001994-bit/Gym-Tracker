import { describe, it, expect } from 'vitest';
import { prepareActiveDraftPayload } from './setSync';

describe('setSync', () => {
  it('prepares clean active set draft payload for real-time cloud sync', () => {
    const mockLogs = [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        category: 'Chest',
        restSeconds: 120,
        notes: '',
        alternatives: [],
        sets: [

          { setNum: 1, weightKg: 80, reps: 10, completed: true },
          { setNum: 2, weightKg: 80, reps: 8, completed: false },
        ],
      },
    ];

    const payload = prepareActiveDraftPayload('routine-upper', mockLogs);

    expect(payload.routineId).toBe('routine-upper');
    expect(payload.completedSetsCount).toBe(1);
    expect(payload.exerciseLogs[0].sets).toHaveLength(1);
    expect(payload.exerciseLogs[0].sets[0].weightKg).toBe(80);
    expect(payload.updatedAt).toBeDefined();
  });
});
