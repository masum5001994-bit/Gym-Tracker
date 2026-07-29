import { Router } from 'express';
import {
  getRoutines,
  getRoutineById,
  getExercises,
  getExerciseById,
  getExerciseHistory,
  createWorkout,
  getWorkouts,
  getVolumeMatrix,
  getAnalyticsSummary,
} from '../controllers/apiControllers';

const router = Router();

// Routines
router.get('/routines', getRoutines);
router.get('/routines/:id', getRoutineById);

// Exercises
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExerciseById);
router.get('/exercises/:id/history', getExerciseHistory);

// Workouts
router.post('/workouts', createWorkout);
router.get('/workouts', getWorkouts);

// Analytics
router.get('/analytics/volume-matrix', getVolumeMatrix);
router.get('/analytics/summary', getAnalyticsSummary);

export default router;
