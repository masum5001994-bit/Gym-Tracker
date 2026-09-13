import React from 'react';
import { Sparkles, Dumbbell, UserCheck, Flame } from 'lucide-react';

export type RoutineTier = 'all' | 'beginner' | 'intermediate' | 'personal';

interface RoutineTierSelectorProps {
  activeTier: RoutineTier;
  onSelectTier: (tier: RoutineTier) => void;
  counts: {
    all: number;
    beginner: number;
    intermediate: number;
    personal: number;
  };
}

export const RoutineTierSelector: React.FC<RoutineTierSelectorProps> = ({
  activeTier,
  onSelectTier,
  counts,
}) => {
  return (
    <div className="space-y-3">
      {/* Tier Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectTier('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition shrink-0 font-condensed border ${
            activeTier === 'all'
              ? 'bg-slate-100 text-slate-950 border-slate-100 shadow-lg'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>All Splits</span>
          <span className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-300">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => onSelectTier('beginner')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition shrink-0 font-condensed border ${
            activeTier === 'beginner'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/40'
          }`}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          <span>🟢 Beginner</span>
          <span className="ml-1 rounded-full bg-emerald-950/80 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300 border border-emerald-800/60">
            {counts.beginner}
          </span>
        </button>

        <button
          onClick={() => onSelectTier('intermediate')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition shrink-0 font-condensed border ${
            activeTier === 'intermediate'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/80 text-amber-400 border-amber-900/50 hover:bg-amber-950/40'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>🟡 Intermediate</span>
          <span className="ml-1 rounded-full bg-amber-950/80 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-300 border border-amber-800/60">
            {counts.intermediate}
          </span>
        </button>

        <button
          onClick={() => onSelectTier('personal')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition shrink-0 font-condensed border ${
            activeTier === 'personal'
              ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/80 text-purple-400 border-purple-900/50 hover:bg-purple-950/40'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>🟣 Personal Profile</span>
          <span className="ml-1 rounded-full bg-purple-950/80 px-2 py-0.5 text-[9px] font-mono font-bold text-purple-300 border border-purple-800/60">
            {counts.personal}
          </span>
        </button>
      </div>

      {/* Dynamic Tier Banner Explainer */}
      <div className="rounded-2xl bg-slate-900/60 p-3 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        {activeTier === 'beginner' && (
          <p className="text-slate-300 leading-snug">
            <strong className="text-emerald-400 font-bold">Beginner Track:</strong> Simple, high-frequency 3-Day science-backed splits focused on mastering exercise form & foundation building.
          </p>
        )}
        {activeTier === 'intermediate' && (
          <p className="text-slate-300 leading-snug">
            <strong className="text-amber-400 font-bold">Intermediate Track:</strong> 4-Day & 5-Day hypertrophy splits (Upper/Lower, PPL) designed for muscle growth & progressive volume.
          </p>
        )}
        {activeTier === 'personal' && (
          <p className="text-slate-300 leading-snug">
            <strong className="text-purple-400 font-bold">Personal Profile Track:</strong> Your customized gym routines built from the 1,324+ animated exercise database.
          </p>
        )}
        {activeTier === 'all' && (
          <p className="text-slate-400 leading-snug">
            Browse all science-backed preset programs and custom routines built for your profile.
          </p>
        )}
      </div>
    </div>
  );
};
