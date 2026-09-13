import { CustomProgram } from '../types';

const STORAGE_KEY = 'bws_custom_programs_v1';
const ACTIVE_PROGRAM_KEY = 'bws_active_program_id_v1';

export const PRESET_BEGINNER_PROGRAMS: CustomProgram[] = [
  {
    id: 'preset_beginner_3day_fullbody',
    title: '🟢 3-Day Novice Full Body',
    description: 'Science-backed 3-day split for beginners focused on mastering core compound movements & rapid strength progression.',
    focus: 'Beginner Strength & Form',
    isCustom: false,
    tier: 'beginner',
    createdAt: new Date().toISOString(),
    days: [
      {
        dayNum: 1,
        dayLabel: 'Day 1',
        type: 'workout',
        title: 'Full Body A',
        focus: 'Chest, Back, Legs & Core',
        exercises: [
          { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Bench Press', category: 'CHEST', defaultSets: 3, targetReps: '8-10', restSeconds: 120 },
          { exerciseId: 'lat-pulldowns', exerciseName: 'Lat Pulldown', category: 'BACK', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'goblet-squat', exerciseName: 'Goblet Squat', category: 'LEGS', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'standing-overhead-press', exerciseName: 'Dumbbell Shoulder Press', category: 'SHOULDERS', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
        ],
      },
      { dayNum: 2, dayLabel: 'Day 2', type: 'rest', title: 'Rest & Active Recovery', focus: 'Rest', exercises: [] },
      {
        dayNum: 3,
        dayLabel: 'Day 3',
        type: 'workout',
        title: 'Full Body B',
        focus: 'Legs, Back & Arms',
        exercises: [
          { exerciseId: 'romanian-deadlift', exerciseName: 'Dumbbell Romanian Deadlift', category: 'LEGS', defaultSets: 3, targetReps: '10-12', restSeconds: 120 },
          { exerciseId: 'seated-cable-rows', exerciseName: 'Seated Cable Row', category: 'BACK', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'incline-db-press', exerciseName: 'Incline Dumbbell Press', category: 'CHEST', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'biceps-curls', exerciseName: 'Dumbbell Bicep Curl', category: 'ARMS', defaultSets: 3, targetReps: '12-15', restSeconds: 60 },
        ],
      },
      { dayNum: 4, dayLabel: 'Day 4', type: 'rest', title: 'Rest & Mobility', focus: 'Rest', exercises: [] },
      {
        dayNum: 5,
        dayLabel: 'Day 5',
        type: 'workout',
        title: 'Full Body C',
        focus: 'Comprehensive Hypertrophy',
        exercises: [
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', category: 'LEGS', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'push-ups', exerciseName: 'Push-Ups', category: 'CHEST', defaultSets: 3, targetReps: '12-15', restSeconds: 60 },
          { exerciseId: 'pull-ups', exerciseName: 'Lat Pulldown / Pull-Up', category: 'BACK', defaultSets: 3, targetReps: '8-10', restSeconds: 90 },
          { exerciseId: 'tricep-rope-pushdown', exerciseName: 'Tricep Rope Pushdown', category: 'ARMS', defaultSets: 3, targetReps: '12-15', restSeconds: 60 },
        ],
      },
    ],
  },
];

export const PRESET_INTERMEDIATE_PROGRAMS: CustomProgram[] = [
  {
    id: 'preset_intermediate_5day_pplul',
    title: '🟡 5-Day High Volume PPL-UL Split',
    description: 'BWS Higher Volume 5-day Push/Pull/Legs + Upper/Lower split engineered for maximum hypertrophy.',
    focus: 'Hypertrophy & Volume',
    isCustom: false,
    tier: 'intermediate',
    createdAt: new Date().toISOString(),
    days: [
      {
        dayNum: 1,
        dayLabel: 'Day 1',
        type: 'workout',
        title: 'Push Workout A',
        focus: 'Chest, Shoulders & Triceps',
        exercises: [
          { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Bench Press', category: 'CHEST', defaultSets: 4, targetReps: '6-8', restSeconds: 150 },
          { exerciseId: 'incline-db-press', exerciseName: 'Incline Dumbbell Press', category: 'CHEST', defaultSets: 3, targetReps: '8-10', restSeconds: 120 },
          { exerciseId: 'standing-overhead-press', exerciseName: 'Standing Dumbbell Press', category: 'SHOULDERS', defaultSets: 3, targetReps: '8-10', restSeconds: 90 },
          { exerciseId: 'lateral-raises', exerciseName: 'Cable Lateral Raise', category: 'SHOULDERS', defaultSets: 4, targetReps: '12-15', restSeconds: 60 },
          { exerciseId: 'tricep-rope-pushdown', exerciseName: 'Tricep Rope Pushdown', category: 'ARMS', defaultSets: 3, targetReps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNum: 2,
        dayLabel: 'Day 2',
        type: 'workout',
        title: 'Pull Workout A',
        focus: 'Lats, Upper Back & Biceps',
        exercises: [
          { exerciseId: 'lat-pulldowns', exerciseName: 'Lat Pulldown', category: 'BACK', defaultSets: 4, targetReps: '8-10', restSeconds: 120 },
          { exerciseId: 'seated-cable-rows', exerciseName: 'Seated Cable Row', category: 'BACK', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'face-pulls', exerciseName: 'Face Pulls', category: 'SHOULDERS', defaultSets: 4, targetReps: '15-20', restSeconds: 60 },
          { exerciseId: 'biceps-curls', exerciseName: 'Dumbbell Bicep Curl', category: 'ARMS', defaultSets: 3, targetReps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNum: 3,
        dayLabel: 'Day 3',
        type: 'workout',
        title: 'Legs Workout A',
        focus: 'Quads, Hamstrings & Calves',
        exercises: [
          { exerciseId: 'barbell-back-squats', exerciseName: 'Barbell Back Squat', category: 'LEGS', defaultSets: 4, targetReps: '6-8', restSeconds: 180 },
          { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', category: 'LEGS', defaultSets: 3, targetReps: '8-10', restSeconds: 120 },
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', category: 'LEGS', defaultSets: 3, targetReps: '10-12', restSeconds: 90 },
          { exerciseId: 'standing-calf-raises', exerciseName: 'Standing Calf Raise', category: 'LEGS', defaultSets: 4, targetReps: '12-15', restSeconds: 60 },
        ],
      },
      { dayNum: 4, dayLabel: 'Day 4', type: 'rest', title: 'Rest & Recovery', focus: 'Rest', exercises: [] },
      {
        dayNum: 5,
        dayLabel: 'Day 5',
        type: 'workout',
        title: 'Upper Body Hypertrophy',
        focus: 'Upper Body Volume',
        exercises: [
          { exerciseId: 'incline-db-press', exerciseName: 'Incline Dumbbell Press', category: 'CHEST', defaultSets: 3, targetReps: '8-10', restSeconds: 90 },
          { exerciseId: 'seated-cable-rows', exerciseName: 'Seated Cable Row', category: 'BACK', defaultSets: 3, targetReps: '8-10', restSeconds: 90 },
          { exerciseId: 'high-low-cable-fly', exerciseName: 'Cable Chest Fly', category: 'CHEST', defaultSets: 3, targetReps: '12-15', restSeconds: 60 },
          { exerciseId: 'biceps-curls', exerciseName: 'Incline Bicep Curl', category: 'ARMS', defaultSets: 3, targetReps: '10-12', restSeconds: 60 },
        ],
      },
    ],
  },
];

export function getCustomPrograms(): CustomProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const personal = raw ? JSON.parse(raw) : [];
    return personal.map((p: CustomProgram) => ({ ...p, isCustom: true, tier: 'personal' }));
  } catch (err) {
    console.error('Failed to read custom programs:', err);
    return [];
  }
}

export function getAllPrograms(): CustomProgram[] {
  const personal = getCustomPrograms();
  return [...PRESET_BEGINNER_PROGRAMS, ...PRESET_INTERMEDIATE_PROGRAMS, ...personal];
}

export function saveCustomProgram(program: CustomProgram): void {
  try {
    const existing = getCustomPrograms();
    const formatted = { ...program, isCustom: true, tier: 'personal' as const };
    const idx = existing.findIndex((p) => p.id === program.id);
    if (idx !== -1) {
      existing[idx] = formatted;
    } else {
      existing.unshift(formatted);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save custom program:', err);
  }
}

export function deleteCustomProgram(programId: string): void {
  try {
    const existing = getCustomPrograms().filter((p) => p.id !== programId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to delete custom program:', err);
  }
}

export function getActiveProgramId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROGRAM_KEY);
  } catch {
    return null;
  }
}

export function setActiveProgramId(programId: string): void {
  try {
    localStorage.setItem(ACTIVE_PROGRAM_KEY, programId);
  } catch (err) {
    console.error('Failed to set active program:', err);
  }
}
