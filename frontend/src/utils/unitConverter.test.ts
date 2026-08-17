import { describe, it, expect } from 'vitest';
import { kgToLbs, lbsToKg, formatWeight, getExerciseUnitPreference, saveExerciseUnitPreference } from './unitConverter';

describe('unitConverter utility', () => {
  it('converts KG to LBS correctly', () => {
    expect(kgToLbs(100)).toBe(220.5);
    expect(kgToLbs(50)).toBe(110.2);
    expect(kgToLbs(0)).toBe(0);
  });

  it('converts LBS to KG correctly', () => {
    expect(lbsToKg(220.5)).toBe(100);
    expect(lbsToKg(100)).toBe(45.4);
    expect(lbsToKg(0)).toBe(0);
  });

  it('formats weight with unit string', () => {
    expect(formatWeight(100, 'kg')).toBe('100 kg');
    expect(formatWeight(100, 'lbs')).toBe('220.5 lbs');
  });

  it('saves and retrieves per-exercise unit preference', () => {
    const exId = 'ex-bench-press';
    saveExerciseUnitPreference(exId, 'lbs');
    expect(getExerciseUnitPreference(exId)).toBe('lbs');

    saveExerciseUnitPreference(exId, 'kg');
    expect(getExerciseUnitPreference(exId)).toBe('kg');
  });
});
