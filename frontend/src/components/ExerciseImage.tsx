import React, { useState, useEffect } from 'react';
import { Dumbbell, X, ZoomIn } from 'lucide-react';
import { BWSStepGuideGraphic } from './BWSStepGuideGraphic';

interface ExerciseImageProps {
  exerciseName: string;
  category: string;
  className?: string;
  notes?: string;
  step1Setup?: string;
  step2Execution?: string;
  step3Execution?: string;
  additionalTips?: string;
}

// Authentic BWS 4-Panel Custom PDF Studio Guide Photos
const EXERCISE_IMAGE_MAP: Record<string, string> = {
  'Barbell Bench Press': '/images/bench_press.jpg',
  'Barbell Back Squat': '/images/barbell_squat.jpg',
  'Barbell Deadlift': '/images/deadlift.jpg',
  'Standing Barbell OHP': '/images/ohp.jpg',
  'Lat Pulldown': '/images/lat_pulldown.jpg',
  'DB Chest Supported Row': '/images/db_chest_row.jpg',
  'Low Incline Dumbbell Press': '/images/incline_db_press.jpg',
  'Barbell Hip Thrust': '/images/hip_thrust.jpg',
  'Incline Dumbbell Curls': '/images/biceps_curls.jpg',
  'Standing High-to-Low Cable Flyes': '/images/high_low_cable_fly.jpg',
  '(Weighted) Pull-Ups': '/images/pull_ups.jpg',
  'Bulgarian Split Squat (Glute Focused)': '/images/bulgarian_split_squat.jpg',
  'Flat Dumbbell Press': '/images/flat_db_press.svg',
};

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  exerciseName,
  category,
  className = 'h-48 sm:h-56 w-full object-cover rounded-xl',
  notes,
  step1Setup,
  step2Execution,
  step3Execution,
  additionalTips,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const staticImageUrl = EXERCISE_IMAGE_MAP[exerciseName];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    if (isZoomed) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  // If exercise has a static 4-panel BWS PDF photo, render the photo with Lightbox Zoom
  if (staticImageUrl && !imageError) {
    return (
      <>
        <div
          onClick={() => setIsZoomed(true)}
          className="relative overflow-hidden rounded-2xl group border border-slate-800 shadow-lg cursor-pointer touch-manipulation"
          title="Click or tap to enlarge BWS PDF guide"
        >
          <img
            src={staticImageUrl}
            alt={`${exerciseName} BWS PDF Step-by-Step Visual Guide`}
            onError={() => setImageError(true)}
            className={`${className} transition-transform duration-500 group-hover:scale-105 filter brightness-95 contrast-105`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Category Tag */}
          <span className="absolute bottom-2.5 left-3 rounded-full bg-blue-600/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 border border-blue-500/40 backdrop-blur-md">
            {category}
          </span>

          {/* Zoom Hint Icon */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-xl bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-amber-400 border border-amber-400/30 opacity-90 group-hover:scale-110 transition-transform">
            <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Tap to Enlarge</span>
          </div>
        </div>

        {/* Full-Screen Lightbox Zoom Modal */}
        {isZoomed && (
          <div
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-3xl glass-panel p-4 shadow-2xl border border-blue-500/40 overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 border border-blue-500/30">
                    {category}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-100 mt-1 uppercase font-condensed tracking-wide">
                    {exerciseName}
                  </h2>
                </div>
                <button
                  onClick={() => setIsZoomed(false)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition active:scale-95 touch-manipulation"
                  aria-label="Close photo preview"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-800 max-h-[65vh] bg-slate-950 flex items-center justify-center">
                <img
                  src={staticImageUrl}
                  alt={`${exerciseName} High Definition View`}
                  className="max-h-[60vh] w-full object-contain filter brightness-105 contrast-105"
                />
              </div>

              {notes && (
                <p className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  <strong className="text-amber-400">Execution Cues:</strong> {notes}
                </p>
              )}

              <div className="text-center pt-1">
                <button
                  onClick={() => setIsZoomed(false)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
                >
                  Close Preview (Esc)
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Otherwise, render compact touch thumbnail that opens the 4-panel BWS PDF Guide in full modal overlay
  return (
    <>
      <div
        onClick={() => setIsZoomed(true)}
        className="relative overflow-hidden rounded-2xl group border border-blue-500/40 bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-950 p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer touch-manipulation min-h-[60px] max-w-[110px]"
        title="Tap to view BWS PDF Step Guide"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/30 text-amber-400 border border-blue-400/40 mb-1">
          <Dumbbell className="h-4 w-4 stroke-[2.5]" />
        </div>
        <span className="text-[9px] font-black uppercase text-amber-400 font-condensed tracking-wider line-clamp-1">
          {category}
        </span>
        <span className="text-[8px] text-blue-300 font-bold uppercase tracking-tight block">
          TAP BWS GUIDE
        </span>
      </div>

      {/* Full-Screen BWS Step Guide Modal */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl glass-panel p-3.5 sm:p-5 shadow-2xl border border-blue-500/40 max-h-[90vh] overflow-y-auto space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 border border-blue-500/30">
                  {category}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-100 mt-0.5 uppercase font-condensed tracking-wide">
                  {exerciseName}
                </h2>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition active:scale-95 touch-manipulation min-h-[44px]"
                aria-label="Close form guide"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <BWSStepGuideGraphic
              exerciseName={exerciseName}
              category={category}
              step1Setup={step1Setup || notes}
              step2Execution={step2Execution}
              step3Execution={step3Execution}
              additionalTips={additionalTips}
            />

            <div className="text-center pt-1">
              <button
                onClick={() => setIsZoomed(false)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 border border-slate-800 transition active:scale-95 uppercase font-condensed tracking-wider"
              >
                Close Form Guide (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

