import React, { useState } from 'react';
import { X, Dumbbell, BookOpen, ExternalLink, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../types';
import { ExerciseImage } from './ExerciseImage';

interface FormGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export const FormGuideDrawer: React.FC<FormGuideDrawerProps> = ({ isOpen, onClose, exercise }) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'tips' | 'alternatives'>('setup');

  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-t-3xl glass-panel-impeccable p-5 sm:p-6 border-t border-gym-primary/40 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto bg-gym-card text-gym-text apple-spring animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handlebar & Close Button */}
        <div className="flex items-center justify-between border-b border-gym-border pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gym-primary/20 border border-gym-primary/50 text-gym-primary shadow-sm shrink-0">
              <BookOpen className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase text-gym-primary font-condensed tracking-wide leading-none apple-display-title">
                  {exercise.name}
                </h3>
                {exercise.pdfPage && (
                  <span className="text-[10px] font-mono font-bold text-slate-950 bg-gym-secondary px-2 py-0.5 rounded-md shrink-0">
                    {exercise.pdfPage}
                  </span>
                )}
              </div>
              <p className="text-xs text-gym-muted font-semibold pt-0.5">Science Form & Execution Guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gym-bg text-gym-muted hover:text-gym-text border border-gym-border apple-press"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Animated Exercise Visual Guide */}
        <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gym-border bg-slate-950">
          <ExerciseImage
            exerciseName={exercise.name}
            category={exercise.category}
            gifUrl={exercise.gifUrl}
            thumbnailUrl={exercise.thumbnailUrl}
            className="h-52 w-full object-cover"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-gym-bg p-1 rounded-xl border border-gym-border">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg font-condensed transition-all apple-press ${
              activeTab === 'setup'
                ? 'bg-gym-primary text-slate-950 shadow-md font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            3-Step Setup
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg font-condensed transition-all apple-press ${
              activeTab === 'tips'
                ? 'bg-gym-primary text-slate-950 shadow-md font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            Coach Tips
          </button>

          {exercise.alternatives && exercise.alternatives.length > 0 && (
            <button
              onClick={() => setActiveTab('alternatives')}
              className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg font-condensed transition-all apple-press ${
                activeTab === 'alternatives'
                  ? 'bg-gym-primary text-slate-950 shadow-md font-extrabold'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              Alternatives
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="space-y-3 pt-1">
          {activeTab === 'setup' && (
            <div className="space-y-3">
              {exercise.step1Setup && (
                <div className="p-3.5 rounded-2xl bg-gym-bg border border-gym-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-gym-primary font-condensed uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-gym-primary" />
                    <span>STEP 1: SETUP & ALIGNMENT</span>
                  </div>
                  <p className="text-xs text-gym-text leading-relaxed font-medium pl-6">{exercise.step1Setup}</p>
                </div>
              )}

              {exercise.step2Execution && (
                <div className="p-3.5 rounded-2xl bg-gym-bg border border-gym-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-gym-secondary font-condensed uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-gym-secondary" />
                    <span>STEP 2: ECCENTRIC & DRIVE</span>
                  </div>
                  <p className="text-xs text-gym-text leading-relaxed font-medium pl-6">{exercise.step2Execution}</p>
                </div>
              )}

              {exercise.step3Execution && (
                <div className="p-3.5 rounded-2xl bg-gym-bg border border-gym-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 font-condensed uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>STEP 3: PEAK CONTRACTION</span>
                  </div>
                  <p className="text-xs text-gym-text leading-relaxed font-medium pl-6">{exercise.step3Execution}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              {exercise.notes && (
                <div className="p-3.5 rounded-2xl bg-gym-bg border border-gym-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-gym-primary font-condensed uppercase tracking-wider">
                    <Lightbulb className="h-4 w-4 text-gym-primary" />
                    <span>SCIENCE EXECUTION NOTES</span>
                  </div>
                  <p className="text-xs text-gym-text leading-relaxed font-medium pl-6">{exercise.notes}</p>
                </div>
              )}

              {exercise.additionalTips && (
                <div className="p-3.5 rounded-2xl bg-gym-bg border border-gym-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400 font-condensed uppercase tracking-wider">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span>PRO ATHLETE TIP</span>
                  </div>
                  <p className="text-xs text-gym-text leading-relaxed font-medium pl-6">{exercise.additionalTips}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alternatives' && (
            <div className="space-y-2">
              <p className="text-xs text-gym-muted font-bold mb-2">Equivalent Equipment & Machine Alternatives:</p>
              {exercise.alternatives?.map((alt, idx) => {
                const match = alt.match(/^(.*?)\s*\((https?:\/\/[^\)]+)\)$/);
                const title = match ? match[1] : alt;
                const url = match ? match[2] : null;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gym-bg border border-gym-border flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-gym-text font-condensed uppercase tracking-wide">{title}</span>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-black text-gym-primary hover:underline font-condensed uppercase tracking-wider"
                      >
                        <span>Watch Demo</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
