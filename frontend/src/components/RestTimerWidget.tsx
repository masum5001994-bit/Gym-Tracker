import React from 'react';
import { Play, Pause, FastForward, Plus, Minus, Volume2, VolumeX, Timer } from 'lucide-react';

interface RestTimerWidgetProps {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  exerciseName: string;
  progressPercent: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onPause: () => void;
  onResume: () => void;
  onAddSeconds: (seconds: number) => void;
  onSkip: () => void;
  onPlayPreviewSound?: () => void;
}

export const RestTimerWidget: React.FC<RestTimerWidgetProps> = ({
  secondsRemaining,
  totalSeconds,
  isRunning,
  exerciseName,
  progressPercent,
  audioEnabled,
  onToggleAudio,
  onPause,
  onResume,
  onAddSeconds,
  onSkip,
  onPlayPreviewSound,
}) => {
  if (secondsRemaining <= 0 && !isRunning) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-50 rounded-3xl glass-panel p-4 shadow-2xl shadow-emerald-950/80 border border-emerald-400/50 animate-ring-pulse bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
            <Timer className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 font-condensed">REST TIMER</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onToggleAudio();
              if (onPlayPreviewSound && !audioEnabled) onPlayPreviewSound();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 apple-press"
            title={audioEnabled ? 'Audio Beeps Enabled' : 'Audio Muted'}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>
          <button
            onClick={onSkip}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 apple-press"
            title="Skip Rest"
          >
            <FastForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Circular SVG progress */}
        <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-900"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-400 transition-all duration-300 ease-linear"
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-black font-mono text-emerald-300 tracking-tight">{timeFormatted}</span>
        </div>

        {/* Info & touch-friendly controls */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-200 truncate font-bold">{exerciseName}</p>
          <div className="flex items-center gap-1.5 mt-2">
            {isRunning ? (
              <button
                onClick={onPause}
                className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 apple-press border border-slate-800 min-h-[36px]"
              >
                <Pause className="h-3.5 w-3.5 text-amber-400" /> Pause
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex items-center gap-1 rounded-xl bg-emerald-400 px-3 py-1.5 text-xs font-black text-slate-950 apple-press shadow-md min-h-[36px]"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Resume
              </button>
            )}

            <button
              onClick={() => onAddSeconds(30)}
              className="flex items-center justify-center rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-black text-emerald-400 apple-press border border-emerald-500/30 min-h-[36px]"
              title="Add 30 Seconds"
            >
              +30s
            </button>
            <button
              onClick={() => onAddSeconds(-10)}
              className="flex items-center justify-center rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-400 apple-press border border-slate-800 min-h-[36px]"
              title="Subtract 10 Seconds"
            >
              -10s
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

