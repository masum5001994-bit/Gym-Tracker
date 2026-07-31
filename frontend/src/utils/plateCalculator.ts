export interface PlateCalculation {
  targetWeightKg: number;
  barWeightKg: number;
  weightPerSideKg: number;
  platesPerSide: number[];
  remainingKg: number;
}

export interface WarmupSet {
  setNum: number;
  percent: number;
  weightKg: number;
  reps: number;
  note: string;
}

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export function calculatePlates(targetWeightKg: number, barWeightKg = 20): PlateCalculation {
  if (targetWeightKg <= barWeightKg) {
    return {
      targetWeightKg,
      barWeightKg,
      weightPerSideKg: 0,
      platesPerSide: [],
      remainingKg: 0,
    };
  }

  const totalPlateWeight = targetWeightKg - barWeightKg;
  let weightPerSide = totalPlateWeight / 2;
  const initialPerSide = weightPerSide;
  const platesPerSide: number[] = [];

  for (const plate of AVAILABLE_PLATES) {
    while (weightPerSide >= plate - 0.001) {
      platesPerSide.push(plate);
      weightPerSide = Math.round((weightPerSide - plate) * 1000) / 1000;
    }
  }

  return {
    targetWeightKg,
    barWeightKg,
    weightPerSideKg: initialPerSide,
    platesPerSide,
    remainingKg: Math.round(weightPerSide * 2 * 10) / 10,
  };
}

export function calculateWarmupSets(targetWeightKg: number, barWeightKg = 20): WarmupSet[] {
  const roundedTarget = Math.max(barWeightKg, Math.round(targetWeightKg / 2.5) * 2.5);

  const w1 = Math.max(barWeightKg, Math.round((roundedTarget * 0.5) / 2.5) * 2.5);
  const w2 = Math.max(barWeightKg, Math.round((roundedTarget * 0.7) / 2.5) * 2.5);
  const w3 = Math.max(barWeightKg, Math.round((roundedTarget * 0.85) / 2.5) * 2.5);

  return [
    {
      setNum: 1,
      percent: 50,
      weightKg: w1,
      reps: 10,
      note: 'Light Acclimation / High Velocity',
    },
    {
      setNum: 2,
      percent: 70,
      weightKg: w2,
      reps: 5,
      note: 'Moderate Load / Neural Prep',
    },
    {
      setNum: 3,
      percent: 85,
      weightKg: w3,
      reps: 3,
      note: 'Heavy Single-Rep Feeler',
    },
  ];
}
