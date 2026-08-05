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
    <div className="rounded-3xl glass-panel-impeccable p-4 sm:p-5 shadow-2xl border border-gym-border space-y-4 text-gym-text">
      <div className="flex items-center justify-between px-0.5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gym-primary/20 border border-gym-primary/50 text-gym-primary shadow-sm shrink-0">
            <Target className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gym-primary font-condensed apple-display-title">
              7-DAY MUSCLE VOLUME BENCHMARK
            </h2>
            <p className="text-[10px] text-gym-muted font-bold">14 Sets/Week Science Target</p>
          </div>
        </div>

        {/* Reset Volume Button */}
        <button
          onClick={handleResetClick}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all font-condensed apple-press ${
            justReset
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : confirming
              ? 'bg-rose-500 text-slate-950 border border-rose-400 shadow-md animate-pulse'
              : 'bg-gym-bg text-gym-muted hover:text-gym-text border border-gym-border'
          }`}
          title="Reset weekly completed sets to 0"
        >
          {justReset ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
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
          let barColor = 'bg-gym-primary';

          if (entry.status === 'Optimal') {
            barColor = 'bg-gym-secondary';
          } else if (entry.status === 'High') {
            barColor = 'bg-emerald-400';
          }

          return (
            <div
              key={entry.category}
              className="p-3 rounded-2xl bg-gym-bg border border-gym-border hover:border-gym-primary/50 transition-all shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-gym-text text-[11px] font-condensed tracking-wide uppercase truncate">
                  {entry.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-gym-muted shrink-0">
                  {entry.completedSets} <span className="text-[9px] opacity-70 font-sans">/14s</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-gym-card overflow-hidden border border-gym-border">
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

