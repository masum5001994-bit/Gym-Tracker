import React, { useState } from 'react';
import { VolumeMatrixEntry } from '../types';
import { Target, RotateCcw, Check } from 'lucide-react';

interface VolumeMatrixCardProps {
  matrix: VolumeMatrixEntry[];
  loading?: boolean;
  onResetVolume?: () => void;
}

export const VolumeMatrixCard: React.FC<VolumeMatrixCardProps> = ({ matrix, loading, onResetVolume }) => {
  const [confirming, setConfirming] = useState(false);
  const [justReset, setJustReset] = useState(false);

  const handleResetClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }

    if (onResetVolume) {
      onResetVolume();
    }
    setConfirming(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  if (loading) {
    return (
      <div className="rounded-2xl glass-panel p-3.5 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded mb-3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-800/60 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl glass-panel p-4 sm:p-5 shadow-2xl border border-blue-900/60 space-y-3.5 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-blue-950/40">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-amber-400">
            <Target className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-100 font-condensed">
              7-DAY MUSCLE VOLUME BENCHMARK
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold">14 Sets/Week Science Target</p>
          </div>
        </div>

        {/* Reset Volume Button */}
        <button
          onClick={handleResetClick}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all font-condensed active:scale-95 ${
            justReset
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : confirming
              ? 'bg-rose-500 text-slate-950 border border-rose-400 shadow-md animate-pulse'
              : 'bg-slate-900 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-800'
          }`}
          title="Reset weekly completed sets to 0"
        >
          {justReset ? (
            <>
              <Check className="h-3 w-3" />
              <span>VOLUME RESET</span>
            </>
          ) : confirming ? (
            <>
              <RotateCcw className="h-3 w-3 animate-spin" />
              <span>CONFIRM RESET?</span>
            </>
          ) : (
            <>
              <RotateCcw className="h-3 w-3" />
              <span>RESET 7-DAY VOLUME</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {matrix.map((entry) => {
          let badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
          let barColor = 'bg-gradient-to-r from-amber-500 to-amber-400';

          if (entry.status === 'Optimal') {
            badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            barColor = 'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400';
          } else if (entry.status === 'High') {
            badgeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            barColor = 'bg-gradient-to-r from-blue-500 to-purple-500';
          }

          return (
            <div
              key={entry.category}
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/40 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-black text-slate-200 text-[11px] font-condensed tracking-wide uppercase">
                  {entry.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  {entry.completedSets} <span className="text-[9px] text-slate-500 font-sans">/14s</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(entry.percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
