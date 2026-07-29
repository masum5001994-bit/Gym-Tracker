import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ExternalLink, ShieldCheck, Tag, CheckCircle, Info } from 'lucide-react';
import { Exercise } from '../types';
import { api } from '../services/api';
import { ExerciseImage } from '../components/ExerciseImage';

export const FormGuide: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Triceps', 'Biceps', 'Calves'];

  useEffect(() => {
    setLoading(true);
    api
      .getExercises()
      .then(setExercises)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = selectedCategory === 'All' || ex.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.step1Setup && ex.step1Setup.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 font-condensed tracking-wide uppercase">
            BUILT WITH <span className="text-amber-400">SCIENCE</span> TECHNIQUE MANUAL
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          Official BWS Step-by-Step Setup, Execution Cues, and Video Guides.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search exercises, cues, setup steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-blue-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-semibold"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all touch-manipulation ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading BWS technique guides...</div>
      ) : filteredExercises.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">No matching exercises found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="rounded-3xl glass-panel p-5 border border-blue-900/60 space-y-4 flex flex-col justify-between shadow-xl">
              <div>
                {/* Exercise Picture Header */}
                <ExerciseImage
                  exerciseName={ex.name}
                  category={ex.category}
                  className="h-56 sm:h-64 w-full object-cover rounded-2xl"
                  notes={ex.notes}
                  step1Setup={ex.step1Setup}
                  step2Execution={ex.step2Execution}
                  step3Execution={ex.step3Execution}
                  additionalTips={ex.additionalTips}
                />

                <div className="flex items-center justify-between gap-2 mt-4">
                  <h3 className="text-lg font-black text-slate-100 font-condensed tracking-wide uppercase">{ex.name}</h3>
                  {ex.pdfPage && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/30 shrink-0">
                      {ex.pdfPage}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-blue-400 font-bold mt-1">
                  <span>Target: {ex.targetReps} reps</span>
                  <span>•</span>
                  <span>Rest: {ex.restSeconds}s</span>
                  <span>•</span>
                  <span>{ex.defaultSets} sets</span>
                </div>

                {/* BWS PDF Step 1 & Step 2 Guide Cards */}
                <div className="mt-4 space-y-2.5">
                  {ex.step1Setup && (
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-blue-900/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 uppercase font-condensed">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                        <span>Step 1: Setup</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{ex.step1Setup}</p>
                    </div>
                  )}

                  {ex.step2Execution && (
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-blue-900/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase font-condensed">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                        <span>Step 2: Execution</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{ex.step2Execution}</p>
                    </div>
                  )}

                  {ex.additionalTips && (
                    <div className="p-3 rounded-2xl bg-amber-400/5 border border-amber-400/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase">
                        <Info className="h-3.5 w-3.5 text-amber-400" />
                        <span>Additional Tips</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{ex.additionalTips}</p>
                    </div>
                  )}
                </div>

                {/* Recommended Alternatives with YouTube Links */}
                {ex.alternatives && ex.alternatives.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-wider">
                      BWS Approved Alternatives:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.alternatives.map((altStr) => {
                        const match = altStr.match(/^(.*?)\s*\((https:\/\/youtu\.be\/.*?)\)$/);
                        const altName = match ? match[1] : altStr;
                        const altUrl = match ? match[2] : null;

                        return (
                          <a
                            key={altStr}
                            href={altUrl || `https://www.youtube.com/results?search_query=Built+With+Science+${encodeURIComponent(altName)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-200 hover:text-amber-400 hover:border-amber-400 border border-slate-800 transition"
                          >
                            <span>{altName}</span>
                            <ExternalLink className="h-3 w-3 text-blue-400 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Tutorial Link */}
              <div className="pt-3 border-t border-slate-800/80 mt-4">
                <a
                  href={`https://www.youtube.com/results?search_query=Built+With+Science+${encodeURIComponent(ex.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600/20 py-2.5 text-xs font-black text-blue-400 hover:bg-blue-600 hover:text-slate-100 transition border border-blue-500/30"
                >
                  <ExternalLink className="h-4 w-4" /> Watch BWS Tutorial Video
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
