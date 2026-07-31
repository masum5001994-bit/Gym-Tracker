import { describe, it, expect } from 'vitest';
import { calculatePlates, calculateWarmupSets } from './plateCalculator';

describe('plateCalculator', () => {
  it('correctly calculates plates for 100 kg with a 20 kg bar', () => {
    // 100 kg total - 20 kg bar = 80 kg total plates = 40 kg per side
    const result = calculatePlates(100, 20);
    const sum = result.platesPerSide.reduce((acc, p) => acc + p, 0);
    expect(sum).toBe(40);
    expect(result.remainingKg).toBe(0);
  });


  it('correctly calculates plates for 67.5 kg with a 20 kg bar', () => {
    // 67.5 kg total - 20 kg bar = 47.5 kg = 23.75 kg per side
    // 23.75 kg = 20 kg + 2.5 kg + 1.25 kg = 23.75 kg
    const result = calculatePlates(67.5, 20);
    expect(result.platesPerSide).toEqual([20, 2.5, 1.25]);
    expect(result.remainingKg).toBe(0);
  });

  it('returns empty plates if target weight is less than or equal to bar weight', () => {
    const result = calculatePlates(20, 20);
    expect(result.platesPerSide).toEqual([]);
    expect(result.remainingKg).toBe(0);
  });

  it('generates 3 progressive warmup sets for 100 kg', () => {
    const warmups = calculateWarmupSets(100, 20);
    expect(warmups).toHaveLength(3);
    // Warmup 1: 50% = 50 kg
    expect(warmups[0].weightKg).toBe(50);
    expect(warmups[0].reps).toBe(10);

    // Warmup 2: 70% = 70 kg
    expect(warmups[1].weightKg).toBe(70);
    expect(warmups[1].reps).toBe(5);

    // Warmup 3: 85% = 85 kg
    expect(warmups[2].weightKg).toBe(85);
    expect(warmups[2].reps).toBe(3);
  });
});
