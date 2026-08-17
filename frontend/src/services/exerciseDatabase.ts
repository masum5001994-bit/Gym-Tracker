import { Exercise } from '../types';
import rawDataset from '../data/exercisesDataset.json';

export interface DatasetExerciseRaw {
  id: string;
  name: string;
  category: string;
  body_part?: string;
  equipment?: string;
  target?: string;
  secondary_muscles?: string[];
  image?: string;
  gif_url?: string;
  instruction_steps?: {
    en?: string[];
  };
  instructions?: {
    en?: string;
  };
}

const RAW_ITEMS = rawDataset as unknown as DatasetExerciseRaw[];

const GITHUB_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

// Transform Raw Item into app Exercise format
export function transformDatasetToExercise(raw: DatasetExerciseRaw): Exercise {
  const gifUrl = raw.gif_url ? `${GITHUB_BASE}${raw.gif_url}` : undefined;
  const thumbnailUrl = raw.image ? `${GITHUB_BASE}${raw.image}` : undefined;
  const steps = raw.instruction_steps?.en || (raw.instructions?.en ? [raw.instructions.en] : []);

  // Capitalize title
  const formattedName = raw.name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const categoryName = (raw.category || raw.body_part || 'General')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: `ds-${raw.id}`,
    name: formattedName,
    category: categoryName,
    defaultSets: 3,
    targetReps: '8-12',
    minReps: 8,
    maxReps: 12,
    restSeconds: 90,
    notes: `Equipment: ${raw.equipment || 'body weight'}. Target: ${raw.target || 'General'}.`,
    step1Setup: steps[0] || 'Position yourself properly before initiating movement.',
    step2Execution: steps[1] || 'Execute rep with full control and proper technique.',
    step3Execution: steps[2] || 'Return to start position and repeat.',
    additionalTips: steps.slice(3).join(' ') || undefined,
    alternatives: [],
    gifUrl,
    thumbnailUrl,
    equipment: raw.equipment || 'body weight',
    bodyPart: raw.body_part || raw.category || 'General',
    targetMuscle: raw.target || 'General',
    instructionSteps: steps,
  };
}

// Memory index for instant search
const TRANSFORMED_CACHE: Exercise[] = RAW_ITEMS.map(transformDatasetToExercise);

export function getAllDatasetExercises(): Exercise[] {
  return TRANSFORMED_CACHE;
}

export function searchDatasetExercises(
  queryStr = '',
  categoryFilter = 'ALL',
  equipmentFilter = 'ALL'
): Exercise[] {
  const cleanQ = queryStr.toLowerCase().trim();

  return TRANSFORMED_CACHE.filter((ex) => {
    // Match query
    const nameMatch = !cleanQ || ex.name.toLowerCase().includes(cleanQ) || (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(cleanQ));

    // Match category/bodyPart
    const catMatch =
      categoryFilter === 'ALL' ||
      ex.category.toLowerCase() === categoryFilter.toLowerCase() ||
      (ex.bodyPart && ex.bodyPart.toLowerCase() === categoryFilter.toLowerCase());

    // Match equipment
    const eqMatch =
      equipmentFilter === 'ALL' ||
      (ex.equipment && ex.equipment.toLowerCase() === equipmentFilter.toLowerCase());

    return nameMatch && catMatch && eqMatch;
  });
}

// Get unique categories and equipment
export function getDatasetCategories(): string[] {
  const set = new Set<string>();
  TRANSFORMED_CACHE.forEach((ex) => {
    if (ex.category) set.add(ex.category);
  });
  return Array.from(set).sort();
}

export function getDatasetEquipment(): string[] {
  const set = new Set<string>();
  TRANSFORMED_CACHE.forEach((ex) => {
    if (ex.equipment) set.add(ex.equipment);
  });
  return Array.from(set).sort();
}
