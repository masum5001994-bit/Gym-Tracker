import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  calculateEpley1RM,
  calculateVolumeMatrix,
  calculateSetDelta,
  evaluatePRStatus,
} from '../services/progressiveOverload.service';

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 'user-bws-default';

// Utility helper to safely parse stringified JSON arrays
function parseJsonArray<T>(str: string, fallback: T[] = []): T[] {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * GET /api/routines
 */
export async function getRoutines(req: Request, res: Response) {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: { title: 'asc' },
    });

    // Fetch all exercises to populate exercise details inside each routine
    const allExercises = await prisma.exercise.findMany();
    const exerciseMap = new Map(allExercises.map((ex) => [ex.id, ex]));

    const formattedRoutines = routines.map((routine) => {
      const exerciseIds: string[] = parseJsonArray(routine.exerciseIds);
      const exercises = exerciseIds
        .map((id) => exerciseMap.get(id))
        .filter((ex): ex is NonNullable<typeof ex> => ex !== undefined)
        .map((ex) => ({
          ...ex,
          alternatives: parseJsonArray<string>(ex.alternatives),
        }));

      return {
        ...routine,
        exerciseIds,
        exercises,
      };
    });

    return res.json(formattedRoutines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    return res.status(500).json({ error: 'Failed to fetch routines' });
  }
}

/**
 * GET /api/routines/:id
 */
export async function getRoutineById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const routine = await prisma.routine.findUnique({
      where: { id },
    });

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    const exerciseIds: string[] = parseJsonArray(routine.exerciseIds);
    const exercisesFromDb = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
    });

    const exerciseMap = new Map(exercisesFromDb.map((ex) => [ex.id, ex]));

    // Fetch previous performance for each exercise to enable live workout pre-population
    const formattedExercises = await Promise.all(
      exerciseIds.map(async (exId) => {
        const ex = exerciseMap.get(exId);
        if (!ex) return null;

        // Get the latest completed exercise log for this exercise
        const latestLog = await prisma.exerciseLog.findFirst({
          where: { exerciseId: exId, workoutLog: { userId: DEFAULT_USER_ID } },
          orderBy: { workoutLog: { date: 'desc' } },
          include: { sets: { orderBy: { setNum: 'asc' } } },
        });

        const previousSets = latestLog
          ? latestLog.sets.map((s) => ({
              setNum: s.setNum,
              weightKg: s.weightKg,
              reps: s.reps,
              effort: s.effort || undefined,
              completed: s.completed,
              isPR: s.isPR,
            }))
          : [];

        return {
          ...ex,
          alternatives: parseJsonArray<string>(ex.alternatives),
          previousSets,
        };
      })
    );

    return res.json({
      ...routine,
      exerciseIds,
      exercises: formattedExercises.filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching routine by id:', error);
    return res.status(500).json({ error: 'Failed to fetch routine' });
  }
}

/**
 * GET /api/exercises
 */
export async function getExercises(req: Request, res: Response) {
  try {
    const { category, search } = req.query;

    const where: any = {};
    if (category && typeof category === 'string') {
      where.category = category;
    }
    if (search && typeof search === 'string') {
      where.name = { contains: search };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const formatted = exercises.map((ex) => ({
      ...ex,
      alternatives: parseJsonArray<string>(ex.alternatives),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return res.status(500).json({ error: 'Failed to fetch exercises' });
  }
}

/**
 * GET /api/exercises/:id
 */
export async function getExerciseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    return res.json({
      ...exercise,
      alternatives: parseJsonArray<string>(exercise.alternatives),
    });
  } catch (error) {
    console.error('Error fetching exercise by id:', error);
    return res.status(500).json({ error: 'Failed to fetch exercise' });
  }
}

/**
 * GET /api/exercises/:id/history
 */
export async function getExerciseHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const exerciseLogs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId: id,
        workoutLog: { userId: DEFAULT_USER_ID },
      },
      orderBy: { workoutLog: { date: 'asc' } },
      include: {
        workoutLog: { select: { date: true, routineTitle: true } },
        sets: { orderBy: { setNum: 'asc' } },
      },
    });

    let maxWeightKg = 0;
    let maxEstimated1RM = 0;

    const historyTrend = exerciseLogs.map((log) => {
      const bestSet = log.sets.reduce(
        (best, s) => {
          const epley = calculateEpley1RM(s.weightKg, s.reps);
          if (epley > best.estimated1RM) {
            return { weightKg: s.weightKg, reps: s.reps, estimated1RM: epley };
          }
          return best;
        },
        { weightKg: 0, reps: 0, estimated1RM: 0 }
      );

      if (bestSet.weightKg > maxWeightKg) maxWeightKg = bestSet.weightKg;
      if (bestSet.estimated1RM > maxEstimated1RM) maxEstimated1RM = bestSet.estimated1RM;

      return {
        date: log.workoutLog.date,
        routineTitle: log.workoutLog.routineTitle,
        maxWeightKg: bestSet.weightKg,
        maxReps: bestSet.reps,
        estimated1RM: bestSet.estimated1RM,
        setsCount: log.sets.length,
      };
    });

    return res.json({
      exerciseId: id,
      maxWeightKg,
      maxEstimated1RM,
      history: historyTrend,
    });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    return res.status(500).json({ error: 'Failed to fetch exercise history' });
  }
}

/**
 * POST /api/workouts
 */
export async function createWorkout(req: Request, res: Response) {
  try {
    const { routineId, routineTitle, durationMinutes, exerciseLogs } = req.body;

    if (!routineId || !exerciseLogs || !Array.isArray(exerciseLogs)) {
      return res.status(422).json({ error: 'Invalid workout payload' });
    }

    let totalVolumeKg = 0;
    let prCount = 0;

    // Process each exercise log & set log, checking for PRs
    const processedExerciseLogs = await Promise.all(
      exerciseLogs.map(async (exLog: any) => {
        const { exerciseId, exerciseName, sets } = exLog;

        // Fetch historical maxes for PR evaluation
        const historicalLogs = await prisma.exerciseLog.findMany({
          where: { exerciseId, workoutLog: { userId: DEFAULT_USER_ID } },
          include: { sets: true },
        });

        let histMaxWeight = 0;
        let histMax1RM = 0;

        historicalLogs.forEach((log) => {
          log.sets.forEach((s) => {
            if (s.weightKg > histMaxWeight) histMaxWeight = s.weightKg;
            const epley = calculateEpley1RM(s.weightKg, s.reps);
            if (epley > histMax1RM) histMax1RM = epley;
          });
        });

        const processedSets = sets.map((s: any, idx: number) => {
          const weightKg = Number(s.weightKg) || 0;
          const reps = Number(s.reps) || 0;
          const completed = s.completed !== undefined ? Boolean(s.completed) : true;

          if (completed) {
            totalVolumeKg += weightKg * reps;
          }

          const { isPR } = evaluatePRStatus(weightKg, reps, histMaxWeight, histMax1RM);
          if (isPR && completed) {
            prCount += 1;
          }

          return {
            setNum: idx + 1,
            weightKg,
            reps,
            effort: s.effort || null,
            completed,
            isPR: completed ? isPR : false,
          };
        });

        return {
          exerciseId,
          exerciseName,
          sets: processedSets,
        };
      })
    );

    // Save to Database
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: DEFAULT_USER_ID,
        routineId,
        routineTitle: routineTitle || 'BWS Workout Session',
        durationMinutes: durationMinutes || 45,
        totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
        prCount,
        exerciseLogs: {
          create: processedExerciseLogs.map((el) => ({
            exerciseId: el.exerciseId,
            exerciseName: el.exerciseName,
            sets: {
              create: el.sets.map((s: any) => ({
                setNum: s.setNum,
                weightKg: s.weightKg,
                reps: s.reps,
                completed: s.completed,
                isPR: s.isPR,
              })),
            },
          })),
        },
      },
      include: {
        exerciseLogs: {
          include: { sets: true },
        },
      },
    });

    return res.status(201).json(workoutLog);
  } catch (error) {
    console.error('Error creating workout log:', error);
    return res.status(500).json({ error: 'Failed to create workout log' });
  }
}

/**
 * GET /api/workouts
 */
export async function getWorkouts(req: Request, res: Response) {
  try {
    const workouts = await prisma.workoutLog.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { date: 'desc' },
      include: {
        exerciseLogs: {
          include: { sets: { orderBy: { setNum: 'asc' } } },
        },
      },
    });

    return res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(500).json({ error: 'Failed to fetch workouts' });
  }
}

/**
 * GET /api/analytics/volume-matrix
 */
export async function getVolumeMatrix(req: Request, res: Response) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch exercise logs in the past 7 days
    const recentLogs = await prisma.exerciseLog.findMany({
      where: {
        workoutLog: {
          userId: DEFAULT_USER_ID,
          date: { gte: sevenDaysAgo },
        },
      },
      include: {
        exercise: { select: { category: true } },
        sets: { where: { completed: true } },
      },
    });

    const countsByCategory: Record<string, number> = {};

    recentLogs.forEach((log) => {
      const category = log.exercise.category;
      const completedSetCount = log.sets.length;
      countsByCategory[category] = (countsByCategory[category] || 0) + completedSetCount;
    });

    const matrix = calculateVolumeMatrix(countsByCategory);
    return res.json({
      startDate: sevenDaysAgo,
      endDate: new Date(),
      matrix,
    });
  } catch (error) {
    console.error('Error computing volume matrix:', error);
    return res.status(500).json({ error: 'Failed to compute volume matrix' });
  }
}

/**
 * GET /api/analytics/summary
 */
export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const totalWorkouts = await prisma.workoutLog.count({
      where: { userId: DEFAULT_USER_ID },
    });

    const volumeAggregate = await prisma.workoutLog.aggregate({
      where: { userId: DEFAULT_USER_ID },
      _sum: { totalVolumeKg: true, prCount: true },
    });

    const totalVolumeKg = Math.round((volumeAggregate._sum.totalVolumeKg || 0) * 10) / 10;
    const totalPRs = volumeAggregate._sum.prCount || 0;

    const recentWorkouts = await prisma.workoutLog.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, routineTitle: true, date: true, durationMinutes: true, totalVolumeKg: true, prCount: true },
    });

    return res.json({
      totalWorkouts,
      totalVolumeKg,
      totalPRs,
      recentWorkouts,
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
}
