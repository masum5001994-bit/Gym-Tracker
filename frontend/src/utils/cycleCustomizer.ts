export interface CustomCycleDay {
  dayNum: number;
  dayLabel: string;
  type: 'workout' | 'rest';
  routineId?: string;
  title: string;
  focus: string;
  exerciseCount?: number;
  estimatedMinutes?: number;
  tags: string[];
  exercisePreview: string[];
}

export const DEFAULT_CYCLE_DAYS: CustomCycleDay[] = [
  {
    dayNum: 1,
    dayLabel: 'DAY 1',
    type: 'workout',
    routineId: 'routine-upper-body',
    title: 'Upper Body',
    focus: 'Chest, Back & Shoulders',
    exerciseCount: 6,
    estimatedMinutes: 50,
    tags: ['Chest', 'Back'],
    exercisePreview: [
      'Incline DB Press',
      'Lat Pulldown',
      'Incline DB Fly',
      'Chest Supported Row',
      'Standing Barbell OHP',
      'Incline DB Curls',
    ],
  },
  {
    dayNum: 2,
    dayLabel: 'DAY 2',
    type: 'workout',
    routineId: 'routine-lower-body-1',
    title: 'Lower Body 1',
    focus: 'Quad-Focused',
    exerciseCount: 5,
    estimatedMinutes: 45,
    tags: ['Quads', 'Calves'],
    exercisePreview: [
      'Barbell Squat',
      'Romanian Deadlift',
      'Seated Leg Ext',
      'Walking Lunges',
      'Standing Calf Raises',
    ],
  },
  {
    dayNum: 3,
    dayLabel: 'DAY 3',
    type: 'rest',
    title: 'REST DAY',
    focus: 'Active Recovery & Mobility',
    exerciseCount: 3,
    estimatedMinutes: 20,
    tags: ['Recovery'],
    exercisePreview: ['Light Walking', 'Foam Rolling', 'Mobility Drills'],
  },
  {
    dayNum: 4,
    dayLabel: 'DAY 4',
    type: 'workout',
    routineId: 'routine-push',
    title: 'Push Workout',
    focus: 'Chest, Delts & Triceps',
    exerciseCount: 6,
    estimatedMinutes: 50,
    tags: ['Chest', 'Delts'],
    exercisePreview: [
      'Overhead Press',
      'Incline Press',
      'Cable Flyes',
      'Lateral Raises',
      'Triceps Pushdowns',
      'Skullcrushers',
    ],
  },
  {
    dayNum: 5,
    dayLabel: 'DAY 5',
    type: 'workout',
    routineId: 'routine-pull',
    title: 'Pull Workout',
    focus: 'Lat Back & Biceps',
    exerciseCount: 6,
    estimatedMinutes: 50,
    tags: ['Back', 'Biceps'],
    exercisePreview: [
      'Deadlift',
      'Lat Pulldown',
      'DB Rows',
      'Facepulls',
      'Hammer Curls',
      'Incline Curls',
    ],
  },
  {
    dayNum: 6,
    dayLabel: 'DAY 6',
    type: 'workout',
    routineId: 'routine-lower-body-2',
    title: 'Lower Body 2',
    focus: 'Glutes & Hamstrings',
    exerciseCount: 5,
    estimatedMinutes: 45,
    tags: ['Glutes', 'Hamstrings'],
    exercisePreview: [
      'Barbell Squat',
      'Hip Thrust',
      'Split Squat',
      'Lying Leg Curls',
      'Seated Calf Raises',
    ],
  },
  {
    dayNum: 7,
    dayLabel: 'DAY 7',
    type: 'rest',
    title: 'REST DAY',
    focus: 'Full CNS Reset',
    exerciseCount: 1,
    estimatedMinutes: 0,
    tags: ['CNS Reset'],
    exercisePreview: ['Sleep & Supercompensation'],
  },
];


const STORAGE_KEY = 'bws_custom_cycle_days';

export const getCustomCycleDays = (): CustomCycleDay[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CYCLE_DAYS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 7) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read custom cycle days', e);
  }
  return DEFAULT_CYCLE_DAYS;
};

export const saveCustomCycleDays = (customDays: CustomCycleDay[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customDays));
    window.dispatchEvent(new Event('cycle_days_updated'));
  } catch (e) {
    console.error('Failed to save custom cycle days', e);
  }
};

export const resetCustomCycleDaysToDefault = (): CustomCycleDay[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('cycle_days_updated'));
  } catch (e) {
    console.error('Failed to reset custom cycle days', e);
  }
  return DEFAULT_CYCLE_DAYS;
};
