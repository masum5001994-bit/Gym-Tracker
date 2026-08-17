import { CustomProgram, ProgramDay } from '../types';

const STORAGE_KEY = 'bws_custom_programs_v1';
const ACTIVE_PROGRAM_KEY = 'bws_active_program_id_v1';

export function getCustomPrograms(): CustomProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read custom programs:', err);
    return [];
  }
}

export function saveCustomProgram(program: CustomProgram): void {
  try {
    const existing = getCustomPrograms();
    const idx = existing.findIndex((p) => p.id === program.id);
    if (idx !== -1) {
      existing[idx] = program;
    } else {
      existing.unshift(program);
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
