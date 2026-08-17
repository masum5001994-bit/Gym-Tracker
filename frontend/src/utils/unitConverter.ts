export type WeightUnit = 'kg' | 'lbs';

export const KG_TO_LBS_RATIO = 2.20462262;

/**
 * Convert KG to LBS rounded to 1 decimal place.
 */
export const kgToLbs = (kg: number): number => {
  if (!kg || isNaN(kg)) return 0;
  return Math.round(kg * KG_TO_LBS_RATIO * 10) / 10;
};

/**
 * Convert LBS to KG rounded to 1 decimal place.
 */
export const lbsToKg = (lbs: number): number => {
  if (!lbs || isNaN(lbs)) return 0;
  return Math.round((lbs / KG_TO_LBS_RATIO) * 10) / 10;
};

/**
 * Format weight value according to the target unit.
 * Weight is stored in KG in the database.
 */
export const formatWeight = (weightKg: number, unit: WeightUnit = 'kg'): string => {
  if (unit === 'lbs') {
    const val = kgToLbs(weightKg);
    return `${val} lbs`;
  }
  return `${weightKg} kg`;
};

const inMemoryPrefStore: Record<string, WeightUnit> = {};

/**
 * Retrieve per-exercise unit preference from localStorage with in-memory fallback.
 */
export const getExerciseUnitPreference = (exerciseId: string): WeightUnit => {
  if (inMemoryPrefStore[exerciseId]) {
    return inMemoryPrefStore[exerciseId];
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const key = `bws_unit_pref_${exerciseId}`;
      const saved = localStorage.getItem(key);
      if (saved === 'lbs' || saved === 'kg') {
        return saved;
      }
    }
  } catch (e) {}
  return 'kg';
};

/**
 * Save per-exercise unit preference in localStorage with in-memory fallback.
 */
export const saveExerciseUnitPreference = (exerciseId: string, unit: WeightUnit): void => {
  inMemoryPrefStore[exerciseId] = unit;
  try {
    if (typeof localStorage !== 'undefined') {
      const key = `bws_unit_pref_${exerciseId}`;
      localStorage.setItem(key, unit);
    }
  } catch (e) {}
};

