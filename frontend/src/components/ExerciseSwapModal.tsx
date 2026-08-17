import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, CheckCircle2, Filter } from 'lucide-react';
import { Exercise } from '../types';
import { api } from '../services/api';
import { searchDatasetExercises, getDatasetEquipment } from '../services/exerciseDatabase';
import { ExerciseImage } from './ExerciseImage';

interface ExerciseSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseName: string;
  recommendedAlternatives: string[];
  onSwap: (selectedExercise: Exercise) => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  isOpen,
  onClose,
  currentExerciseName,
  recommendedAlternatives,
  onSwap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('ALL');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Pre-load API exercises combined with dataset
      api.getExercises()
        .then((bwsExs) => {
          setAllExercises(bwsExs);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search across dataset + BWS exercises
  const datasetMatches = searchDatasetExercises(searchQuery, 'ALL', equipmentFilter);
  const combined = searchQuery
    ? datasetMatches.filter((ex) => ex.name.toLowerCase() !== currentExerciseName.toLowerCase())
    : allExercises.concat(datasetMatches.slice(0, 30));

  const availableEquipment = ['ALL', 'dumbbell', 'barbell', 'cable', 'leverage machine', 'body weight', 'smith machine'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-5 shadow-2xl border border-slate-700/60 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-extrabold text-slate-100">Swap Exercise</h2>
              <span className="text-[10px] font-mono text-cyan-400">Search 1,320+ Exercise Database</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Swapping <span className="font-bold text-cyan-300">{currentExerciseName}</span> for this session.
        </p>

        {/* Equipment Filter Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {availableEquipment.map((eq) => (
            <button
              key={eq}
              onClick={() => setEquipmentFilter(eq)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono shrink-0 border transition ${
                equipmentFilter === eq
                  ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mt-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 1,320+ exercises (e.g. Incline, Cable, Squat)..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Exercises Scroll List */}
        <div className="mt-3 overflow-y-auto space-y-2 flex-1 pr-1">
          {combined.slice(0, 40).map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                onSwap(ex);
                onClose();
              }}
              className="p-3 rounded-2xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-3 cursor-pointer transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                  <ExerciseImage
                    exerciseName={ex.name}
                    category={ex.category}
                    gifUrl={ex.gifUrl}
                    thumbnailUrl={ex.thumbnailUrl}
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-cyan-400 font-mono">
                      {ex.category}
                    </span>
                    {ex.equipment && (
                      <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {ex.equipment}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate">{ex.name}</h4>
                </div>
              </div>

              <button className="px-3 py-1 rounded-xl bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider font-condensed shrink-0 shadow-md">
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
