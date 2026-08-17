import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Dumbbell, Search, Sparkles, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomProgram, ProgramDay, Exercise } from '../types';
import { saveCustomProgram, setActiveProgramId } from '../utils/customProgramStorage';
import { searchDatasetExercises } from '../services/exerciseDatabase';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface ProgramBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgramSaved: (program: CustomProgram) => void;
  initialProgram?: CustomProgram | null;
}

export const ProgramBuilderModal: React.FC<ProgramBuilderModalProps> = ({
  isOpen,
  onClose,
  onProgramSaved,
  initialProgram,
}) => {
  const [programTitle, setProgramTitle] = useState(initialProgram?.title || '');
  const [programFocus, setProgramFocus] = useState(initialProgram?.focus || 'Custom Split');
  const [description, setDescription] = useState(initialProgram?.description || 'Custom workout program');

  const [days, setDays] = useState<ProgramDay[]>(
    initialProgram?.days || [
      {
        dayNum: 1,
        dayLabel: 'DAY 1',
        type: 'workout',
        title: 'Push Heavy',
        focus: 'Chest, Shoulders & Triceps',
        exercises: [
          { exerciseId: 'ds-0025', exerciseName: 'Barbell Bench Press', category: 'Chest', defaultSets: 3, targetReps: '8-10', restSeconds: 150 },
          { exerciseId: 'ds-0043', exerciseName: 'Standing Barbell OHP', category: 'Shoulders', defaultSets: 3, targetReps: '8-10', restSeconds: 120 },
        ],
      },
      {
        dayNum: 2,
        dayLabel: 'DAY 2',
        type: 'workout',
        title: 'Pull Heavy',
        focus: 'Back & Biceps',
        exercises: [
          { exerciseId: 'ds-0652', exerciseName: 'Lat Pulldown', category: 'Back', defaultSets: 3, targetReps: '8-10', restSeconds: 120 },
        ],
      },
      {
        dayNum: 3,
        dayLabel: 'DAY 3',
        type: 'rest',
        title: 'Active Recovery',
        focus: 'Rest & Mobility',
        exercises: [],
      },
      {
        dayNum: 4,
        dayLabel: 'DAY 4',
        type: 'workout',
        title: 'Legs & Core',
        focus: 'Quads, Hamstrings & Calves',
        exercises: [
          { exerciseId: 'ds-0032', exerciseName: 'Barbell Squat', category: 'Quads', defaultSets: 3, targetReps: '8-10', restSeconds: 150 },
        ],
      },
    ]
  );

  // Exercise Picker Drawer State
  const [pickerTargetDayIdx, setPickerTargetDayIdx] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  if (!isOpen) return null;

  const handleAddDay = () => {
    triggerHaptic('light');
    const nextNum = days.length + 1;
    setDays([
      ...days,
      {
        dayNum: nextNum,
        dayLabel: `DAY ${nextNum}`,
        type: 'workout',
        title: `Workout Day ${nextNum}`,
        focus: 'Custom Focus',
        exercises: [],
      },
    ]);
  };

  const handleDeleteDay = (idx: number) => {
    triggerHaptic('warning');
    if (days.length <= 1) return;
    const updated = days.filter((_, i) => i !== idx).map((d, newIdx) => ({
      ...d,
      dayNum: newIdx + 1,
      dayLabel: `DAY ${newIdx + 1}`,
    }));
    setDays(updated);
  };

  const handleToggleDayType = (idx: number) => {
    triggerHaptic('light');
    const updated = [...days];
    updated[idx].type = updated[idx].type === 'workout' ? 'rest' : 'workout';
    if (updated[idx].type === 'rest') {
      updated[idx].title = 'Rest & Recovery';
      updated[idx].focus = 'Active Rest';
    }
    setDays(updated);
  };

  const handleAddExerciseToDay = (dayIdx: number, ex: Exercise) => {
    triggerHaptic('medium');
    const updated = [...days];
    updated[dayIdx].exercises.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      defaultSets: 3,
      targetReps: '8-12',
      restSeconds: 90,
    });
    setDays(updated);
    setPickerTargetDayIdx(null);
  };

  const handleRemoveExerciseFromDay = (dayIdx: number, exIdx: number) => {
    triggerHaptic('light');
    const updated = [...days];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle.trim()) {
      alert('Please enter a program title');
      return;
    }

    triggerHaptic('success');
    const newProgram: CustomProgram = {
      id: initialProgram?.id || `prog-custom-${Date.now()}`,
      title: programTitle.trim(),
      focus: programFocus.trim(),
      description: description.trim(),
      isCustom: true,
      createdAt: new Date().toISOString(),
      days,
    };

    saveCustomProgram(newProgram);
    setActiveProgramId(newProgram.id);
    onProgramSaved(newProgram);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  const searchResults = searchDatasetExercises(pickerSearch).slice(0, 30);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-lg">
      <div className="w-full max-w-2xl rounded-3xl glass-panel-impeccable p-5 sm:p-6 shadow-2xl border border-cyan-500/40 max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-100 font-condensed apple-display-title">
                {initialProgram ? 'Edit Custom Program' : 'Create Custom Program'}
              </h2>
              <p className="text-xs text-cyan-400 font-semibold">Design your custom multi-day routine split</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 apple-press"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveProgram} className="overflow-y-auto space-y-4 flex-1 pr-1">
          {/* Program Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1 font-mono">
                Program Title
              </label>
              <input
                type="text"
                required
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                placeholder="e.g. 4-Day Upper/Lower Split"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                Primary Focus
              </label>
              <input
                type="text"
                value={programFocus}
                onChange={(e) => setProgramFocus(e.target.value)}
                placeholder="e.g. Hypertrophy & Muscle Building"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Days Builder Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 font-condensed">
                Program Schedule Days ({days.length} Days)
              </h3>
              <button
                type="button"
                onClick={handleAddDay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-xs font-black uppercase font-condensed tracking-wider apple-press hover:bg-cyan-400 hover:text-slate-950 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            {days.map((day, dayIdx) => (
              <div
                key={day.dayNum}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md"
              >
                {/* Day Header Controls */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-slate-950 bg-cyan-400 px-2.5 py-0.5 rounded-lg">
                      {day.dayLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDayType(dayIdx)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider border ${
                        day.type === 'workout'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                      }`}
                    >
                      {day.type === 'workout' ? '⚡ WORKOUT DAY' : '😴 REST DAY'}
                    </button>
                  </div>

                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDay(dayIdx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 apple-press"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Day Meta Inputs */}
                {day.type === 'workout' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => {
                          const updated = [...days];
                          updated[dayIdx].title = e.target.value;
                          setDays(updated);
                        }}
                        placeholder="Day Title (e.g. Chest & Triceps)"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={day.focus}
                        onChange={(e) => {
                          const updated = [...days];
                          updated[dayIdx].focus = e.target.value;
                          setDays(updated);
                        }}
                        placeholder="Focus (e.g. Upper Chest Focus)"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Assigned Exercises List */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 font-mono">
                        <span>Assigned Movements ({day.exercises.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setPickerTargetDayIdx(dayIdx);
                          }}
                          className="flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Pick from 1,320+ Library</span>
                        </button>
                      </div>

                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={`${ex.exerciseId}-${exIdx}`}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">
                              {ex.category}
                            </span>
                            <h5 className="text-xs font-bold text-slate-100 truncate">{ex.exerciseName}</h5>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-xs font-mono text-slate-300">
                              <input
                                type="number"
                                value={ex.defaultSets}
                                onChange={(e) => {
                                  const updated = [...days];
                                  updated[dayIdx].exercises[exIdx].defaultSets = parseInt(e.target.value, 10) || 3;
                                  setDays(updated);
                                }}
                                className="w-10 text-center bg-slate-900 border border-slate-700 rounded px-1 py-0.5 font-bold text-cyan-400"
                              />
                              <span>Sets</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseFromDay(dayIdx, exIdx)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-400 hover:text-slate-100 apple-press"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider font-condensed shadow-lg shadow-cyan-500/20 apple-press"
            >
              <Save className="h-4 w-4" />
              <span>Save & Activate Program</span>
            </button>
          </div>
        </form>
      </div>

      {/* Mini Picker Overlay for 1,320+ Dataset */}
      {pickerTargetDayIdx !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-5 border border-cyan-400/50 shadow-2xl max-h-[80vh] flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black uppercase text-slate-100 font-condensed">
                Pick Exercise ({days[pickerTargetDayIdx].dayLabel})
              </h3>
              <button
                type="button"
                onClick={() => setPickerTargetDayIdx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search 1,320+ exercises (e.g. Incline, Cable, Squat)..."
                className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {searchResults.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToDay(pickerTargetDayIdx, ex)}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-2 cursor-pointer transition"
                >
                  <div>
                    <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase block">
                      {ex.category} • {ex.equipment}
                    </span>
                    <h5 className="text-xs font-bold text-slate-100">{ex.name}</h5>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 text-[10px] font-black uppercase font-condensed"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
