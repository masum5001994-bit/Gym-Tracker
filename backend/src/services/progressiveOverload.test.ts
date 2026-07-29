import { describe, it, expect } from 'vitest';
import {
  calculateEpley1RM,
  evaluatePRStatus,
  calculateSetDelta,
  calculateVolumeMatrix,
  TARGET_WEEKLY_SETS_PER_MUSCLE,
} from './progressiveOverload.service';

describe('Progressive Overload Calculations', () => {
  describe('calculateEpley1RM', () => {
    it('should correctly calculate 1RM using Epley formula: weight * (1 + reps/30)', () => {
      // 100kg for 10 reps = 100 * (1 + 10/30) = 133.3 kg
      expect(calculateEpley1RM(100, 10)).toBe(133.3);
      // 80kg for 8 reps = 80 * (1 + 8/30) = 101.3 kg
      expect(calculateEpley1RM(80, 8)).toBe(101.3);
    });

    it('should return exact weight for 1 rep', () => {
      expect(calculateEpley1RM(120, 1)).toBe(120);
    });

    it('should return 0 for non-positive inputs', () => {
      expect(calculateEpley1RM(0, 10)).toBe(0);
      expect(calculateEpley1RM(100, 0)).toBe(0);
    });
  });

  describe('evaluatePRStatus', () => {
    it('should mark as PR when weight is higher than historical max weight', () => {
      const result = evaluatePRStatus(105, 5, 100, 120);
      expect(result.isPR).toBe(true);
    });

    it('should mark as PR when estimated 1RM is higher than historical max 1RM', () => {
      // 90kg for 10 reps = 120 1RM (higher than 115 max 1RM)
      const result = evaluatePRStatus(90, 10, 100, 115);
      expect(result.isPR).toBe(true);
    });

    it('should return false if neither weight nor 1RM exceeds historical max', () => {
      const result = evaluatePRStatus(80, 8, 100, 120);
      expect(result.isPR).toBe(false);
    });
  });

  describe('calculateSetDelta', () => {
    it('should compute positive weight and rep deltas', () => {
      const delta = calculateSetDelta({ setNum: 1, weightKg: 82.5, reps: 10 }, { setNum: 1, weightKg: 80, reps: 8 });
      expect(delta.weightDeltaKg).toBe(2.5);
      expect(delta.repDelta).toBe(2);
    });

    it('should handle missing previous performance', () => {
      const delta = calculateSetDelta({ setNum: 1, weightKg: 80, reps: 8 });
      expect(delta.weightDeltaKg).toBe(0);
      expect(delta.repDelta).toBe(0);
    });
  });

  describe('calculateVolumeMatrix', () => {
    it('should correctly classify weekly set counts against target 14 sets', () => {
      const counts = {
        Chest: 14,
        Back: 18,
        Shoulders: 8,
      };

      const matrix = calculateVolumeMatrix(counts);
      const chest = matrix.find((m) => m.category === 'Chest');
      const back = matrix.find((m) => m.category === 'Back');
      const shoulders = matrix.find((m) => m.category === 'Shoulders');

      expect(chest?.status).toBe('Optimal');
      expect(chest?.percentage).toBe(100);

      expect(back?.status).toBe('High');
      expect(shoulders?.status).toBe('Low');
    });
  });
});
