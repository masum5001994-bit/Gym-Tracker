const STORAGE_KEY = 'bws_exercise_renames';

export const getCustomExerciseMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to read custom exercise names', e);
    return {};
  }
};

export const getCustomExerciseName = (originalName: string): string => {
  const map = getCustomExerciseMap();
  return map[originalName] || originalName;
};

export const saveCustomExerciseName = (originalName: string, newName: string): void => {
  try {
    const map = getCustomExerciseMap();
    if (!newName.trim() || newName.trim() === originalName) {
      delete map[originalName];
    } else {
      map[originalName] = newName.trim();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('exercise_names_updated'));
  } catch (e) {
    console.error('Failed to save exercise rename', e);
  }
};

export const resetAllExerciseNames = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('exercise_names_updated'));
  } catch (e) {
    console.error('Failed to reset exercise names', e);
  }
};
