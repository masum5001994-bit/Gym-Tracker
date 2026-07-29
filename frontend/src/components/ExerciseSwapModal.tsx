import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../types';
import { api } from '../services/api';
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
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getExercises()
        .then(setAllExercises)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredExercises = allExercises.filter(
    (ex) =>
      ex.name.toLowerCase() !== currentExerciseName.toLowerCase() &&
      ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-5 shadow-2xl border border-slate-700/60 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-extrabold text-slate-100">Swap Exercise</h2>
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

        {/* BWS PDF Alternatives Section */}
        {recommendedAlternatives.length > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
              BWS Recommended Alternatives
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {recommendedAlternatives.map((altName) => {
                const matchedEx = allExercises.find(
                  (e) => e.name.toLowerCase() === altName.toLowerCase()
                );
                return (
                  <button
                    key={altName}
                    onClick={() => {
                      if (matchedEx) {
                        onSwap(matchedEx);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-cyan-600/30 hover:border-cyan-400 px-2.5 py-1 text-xs font-bold text-slate-200 border border-slate-700 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{altName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search exercise library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/70 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Exercise List with Picture Thumbnails */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading library...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No matching exercises found.</div>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => {
                  onSwap(ex);
                  onClose();
                }}
                className="flex items-center gap-3 p-2.5 rounded-2xl glass-card hover:bg-slate-800/80 cursor-pointer transition border border-slate-800"
              >
                <ExerciseImage
                  exerciseName={ex.name}
                  category={ex.category}
                  className="h-14 w-14 object-cover rounded-xl shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{ex.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-slate-700">
                      {ex.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold truncate">
                      {ex.defaultSets}s × {ex.targetReps} reps
                    </span>
                  </div>
                </div>

                <button className="rounded-xl bg-cyan-600/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-600 hover:text-slate-950 transition shrink-0">
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
