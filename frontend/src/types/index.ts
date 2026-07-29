export interface Exercise {
  id: string;
  name: string;
  category: string;
  defaultSets: number;
  targetReps: string;
  minReps: number;
  maxReps: number;
  restSeconds: number;
  notes: string;
  pdfPage?: string;
  step1Setup?: string;
  step2Execution?: string;
  step3Execution?: string;
  additionalTips?: string;
  alternatives: string[];
  isCustom?: boolean;
  previousSets?: LiveSetLog[];
}

export interface Routine {
  id: string;
  title: string;
  focus: string;
  description: string;
  exerciseIds: string[];
  exercises?: Exercise[];
}

export interface LiveSetLog {
  setNum: number;
  weightKg: number;
  reps: number;
  effort?: string; // Easy, Medium, Hard, Max effort, Failed
  completed: boolean;
  isPR?: boolean;
}

export interface LiveExerciseLog {
  exerciseId: string;
  exerciseName: string;
  category: string;
  restSeconds: number;
  notes: string;
  alternatives: string[];
  sets: LiveSetLog[];
  previousSets?: LiveSetLog[];
}

export interface WorkoutLog {
  id: string;
  routineId: string;
  routineTitle: string;
  date: string;
  durationMinutes: number;
  totalVolumeKg: number;
  prCount: number;
  exerciseLogs: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    sets: LiveSetLog[];
  }[];
}

export interface VolumeMatrixEntry {
  category: string;
  completedSets: number;
  targetSets: number;
  percentage: number;
  status: 'Low' | 'Optimal' | 'High';
}

export interface ExerciseHistoryPoint {
  date: string;
  routineTitle: string;
  maxWeightKg: number;
  maxReps: number;
  estimated1RM: number;
  setsCount: number;
}

export interface ExerciseHistoryResponse {
  exerciseId: string;
  maxWeightKg: number;
  maxEstimated1RM: number;
  history: ExerciseHistoryPoint[];
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalPRs: number;
  recentWorkouts: {
    id: string;
    routineTitle: string;
    date: string;
    durationMinutes: number;
    totalVolumeKg: number;
    prCount: number;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  bodyFatPercentage?: number;
  fitnessGoal: 'Hypertrophy' | 'Strength' | 'Fat Loss' | 'Recomp';
  isProfileSetupCompleted?: boolean;
  updatedAt: string;
}

export interface PRHallOfFameEntry {
  exerciseId: string;
  exerciseName: string;
  category: string;
  maxWeightKg: number;
  maxReps: number;
  estimated1RM: number;
  dateAchieved: string;
}

export interface OverloadDeltaEntry {
  exerciseId: string;
  exerciseName: string;
  category: string;
  latestWeightKg: number;
  previousWeightKg: number;
  weightDeltaKg: number;
  latestReps: number;
  previousReps: number;
  repsDelta: number;
  latest1RM: number;
  previous1RM: number;
  oneRMDeltaKg: number;
  status: 'PR' | 'Gain' | 'Maintained' | 'Lower';
}



