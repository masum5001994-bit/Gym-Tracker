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

export function markDayCompleted(dayNum: number): void {
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
  }
}

export function unmarkDayCompleted(dayNum: number): void {
  const current = getCompletedDayNums();
  const updated = current.filter((d) => d !== dayNum);
  localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('cycle_completion_updated'));
}

export function resetCycleCompletion(): void {
  localStorage.setItem(CYCLE_COMPLETED_DAYS_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('cycle_completion_updated'));
}
