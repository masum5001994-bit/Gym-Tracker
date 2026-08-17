import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { api } from '../services/api';
import { WorkoutLog } from '../types';
import { getCustomCycleDays } from './cycleCustomizer';

const CYCLE_COMPLETED_DAYS_KEY = 'bws_cycle_completed_day_nums_v1';
const CYCLE_WEEK_NUM_KEY = 'bws_cycle_week_number_v1';

export function getCompletedDayNums(): number[] {
  try {
    const raw = localStorage.getItem(CYCLE_COMPLETED_DAYS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function getCycleWeekNumber(): number {
  try {
    const raw = localStorage.getItem(CYCLE_WEEK_NUM_KEY);
    if (raw) return Math.max(1, parseInt(raw, 10));
  } catch (e) {}
  return 1;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T | null> {
  let timer: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).then((res) => {
    clearTimeout(timer);
    return res;
  });
}

export async function syncScheduleToCloud(userId?: string): Promise<void> {
  try {
    const uid = api.getCentralUserId(userId);
    const emailKey = auth.currentUser?.email
      ? auth.currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
      : null;
    const authUid = auth.currentUser?.uid || null;

    const targetUids = Array.from(new Set([uid, authUid, emailKey].filter(Boolean) as string[]));

    const payload = {
      completedDayNums: getCompletedDayNums(),
      weekNumber: getCycleWeekNumber(),
      updatedAt: new Date().toISOString(),
    };

    const syncPromises = targetUids.map((tUid) =>
      withTimeout(setDoc(doc(db, 'users', tUid, 'profile', 'schedule'), payload, { merge: true }), 3000)
    );
    await Promise.all(syncPromises);
  } catch (e) {
    console.warn('Cloud schedule sync note:', e);
  }
}

export async function syncScheduleFromCloud(userId?: string): Promise<void> {
  try {
    const uid = api.getCentralUserId(userId);
    const emailKey = auth.currentUser?.email
      ? auth.currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
      : null;
    const authUid = auth.currentUser?.uid || null;

    const targetUids = Array.from(new Set([uid, authUid, emailKey].filter(Boolean) as string[]));

    for (const tUid of targetUids) {
      const docRef = doc(db, 'users', tUid, 'profile', 'schedule');
      const snap = (await withTimeout(getDoc(docRef), 3000)) as any;
      if (snap && snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.completedDayNums) && data.completedDayNums.length > 0) {
          localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify(data.completedDayNums));
        }
        if (typeof data.weekNumber === 'number' && data.weekNumber > 0) {
          localStorage.setItem(CYCLE_WEEK_NUM_KEY, data.weekNumber.toString());
        }
        window.dispatchEvent(new Event('cycle_completion_updated'));
        break;
      }
    }
  } catch (e) {
    console.warn('Cloud schedule fetch note:', e);
  }
}

/**
 * Automatically infers completed cycle days from workout logs if local storage is fresh/empty
 */
export function reconcileScheduleFromLogs(logs: WorkoutLog[]): number[] {
  const currentCompleted = getCompletedDayNums();
  const validLogs = logs ? logs.filter((w) => !(w as any).deleted) : [];

  if (validLogs.length === 0) {
    return currentCompleted;
  }

  const allCycleDays = getCustomCycleDays();
  const inferredDays = new Set<number>(currentCompleted);

  // 1. Direct match by routineId or title substring
  validLogs.slice(0, 7).forEach((log) => {
    const matchedDay = allCycleDays.find(
      (d) =>
        d.routineId === log.routineId ||
        d.title.toLowerCase() === log.routineTitle?.toLowerCase() ||
        (log.routineTitle && d.title.toLowerCase().includes(log.routineTitle.toLowerCase())) ||
        (log.routineTitle && log.routineTitle.toLowerCase().includes(d.title.toLowerCase()))
    );
    if (matchedDay) {
      inferredDays.add(matchedDay.dayNum);
    }
  });

  // 2. Universal Positional Fallback:
  // If valid logs count > matched days count, map N logs to first N workout days in cycle
  const workoutDaysOnly = allCycleDays.filter((d) => d.type === 'workout');
  if (validLogs.length > inferredDays.size) {
    const logsToCount = Math.min(validLogs.length, workoutDaysOnly.length);
    for (let i = 0; i < logsToCount; i++) {
      inferredDays.add(workoutDaysOnly[i].dayNum);
    }
  }

  if (inferredDays.size > 0) {
    const arr = Array.from(inferredDays).sort((a, b) => a - b);
    localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('cycle_completion_updated'));
    return arr;
  }

  return currentCompleted;
}

export function markDayCompleted(dayNum: number, userId?: string): void {
  const current = getCompletedDayNums();
  if (!current.includes(dayNum)) {
    const updated = [...current, dayNum];
    localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify(updated));

    // If all 7 days completed, auto-advance week & reset days
    if (updated.length >= 7) {
      const nextWeek = getCycleWeekNumber() + 1;
      localStorage.setItem(CYCLE_WEEK_NUM_KEY, nextWeek.toString());
      localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify([]));
    }

    window.dispatchEvent(new Event('cycle_completion_updated'));
    syncScheduleToCloud(userId);
  }
}

export function unmarkDayCompleted(dayNum: number, userId?: string): void {
  const current = getCompletedDayNums();
  const updated = current.filter((d) => d !== dayNum);
  localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('cycle_completion_updated'));
  syncScheduleToCloud(userId);
}

export function resetCycleCompletion(userId?: string): void {
  localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('cycle_completion_updated'));
  syncScheduleToCloud(userId);
}

