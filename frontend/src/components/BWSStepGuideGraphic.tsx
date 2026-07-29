import React from 'react';
import { Dumbbell, ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

interface BWSStepGuideGraphicProps {
  exerciseName: string;
  category: string;
  step1Setup?: string;
  step2Execution?: string;
  step3Execution?: string;
  additionalTips?: string;
}

export const BWSStepGuideGraphic: React.FC<BWSStepGuideGraphicProps> = ({
  exerciseName,
  category,
  step1Setup = 'Position stance/bench according to BWS protocol. Grip weights securely with neutral wrist.',
  step2Execution = 'Initiate movement with controlled tempo. Drive through target muscle group without momentum.',
  step3Execution = 'Reach full range of motion contraction. Hold peak squeeze for 1 second.',
  additionalTips = 'Maintain core bracing throughout. Avoid bouncing at bottom range.',
}) => {
  return (
    <div className="w-full max-w-full rounded-2xl overflow-hidden border border-blue-500/40 bg-slate-950 p-2.5 sm:p-3 shadow-2xl space-y-2 select-none">
      {/* BWS Header Banner */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 border border-blue-400/30">
        <div className="flex items-center gap-2 min-w-0">
          <Dumbbell className="h-4 w-4 text-amber-400 stroke-[2.5] shrink-0" />
          <span className="text-[11px] sm:text-xs font-black text-slate-100 uppercase tracking-wider font-condensed truncate">
            BUILT WITH <span className="text-amber-400">SCIENCE</span> PDF STEP GUIDE
          </span>
        </div>
        <span className="text-[9px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
          {category}
        </span>
      </div>

      {/* 4-Panel BWS PDF Studio Grid (1-col on mobile, 2-col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">

        {/* Panel 1: Step 1 Setup */}
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/80 p-2.5 border border-blue-900/60 flex flex-col justify-between min-h-[105px]">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-1 mb-1.5">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider font-condensed flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-400" /> PANEL 1: SETUP
              </span>
              <span className="text-[9px] font-bold text-slate-400">BWS #1</span>
            </div>
            <p className="text-[10px] text-slate-200 leading-snug line-clamp-3 font-semibold">{step1Setup}</p>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-800/80 text-[9px] text-blue-300 font-bold flex items-center justify-between">
            <span>Stance & Grip</span>
            <ArrowRight className="h-3 w-3 text-amber-400" />
          </div>
        </div>

        {/* Panel 2: Step 2 Execution */}
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/80 p-2.5 border border-blue-900/60 flex flex-col justify-between min-h-[105px]">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-1 mb-1.5">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-condensed flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-amber-400" /> PANEL 2: EXECUTION
              </span>
              <span className="text-[9px] font-bold text-slate-400">BWS #2</span>
            </div>
            <p className="text-[10px] text-slate-200 leading-snug line-clamp-3 font-semibold">{step2Execution}</p>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-800/80 text-[9px] text-amber-300 font-bold flex items-center justify-between">
            <span>Motion Path</span>
            <ArrowRight className="h-3 w-3 text-amber-400" />
          </div>
        </div>

        {/* Panel 3: Step 3 Peak Squeeze */}
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/80 p-2.5 border border-blue-900/60 flex flex-col justify-between min-h-[105px]">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-1 mb-1.5">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-condensed flex items-center gap-1">
                <Zap className="h-3 w-3 text-emerald-400" /> PANEL 3: CONTRACTION
              </span>
              <span className="text-[9px] font-bold text-slate-400">BWS #3</span>
            </div>
            <p className="text-[10px] text-slate-200 leading-snug line-clamp-3 font-semibold">{step3Execution}</p>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-800/80 text-[9px] text-emerald-300 font-bold flex items-center justify-between">
            <span>Peak Squeeze</span>
            <ArrowRight className="h-3 w-3 text-amber-400" />
          </div>
        </div>

        {/* Panel 4: Anatomical Tips */}
        <div className="rounded-xl bg-gradient-to-br from-blue-950/90 to-slate-950 p-2.5 border border-amber-400/30 flex flex-col justify-between min-h-[105px]">
          <div>
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-1 mb-1.5">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-condensed">
                PANEL 4: ANATOMICAL CUES
              </span>
              <span className="text-[9px] font-bold text-amber-400">FOCUS</span>
            </div>
            <p className="text-[10px] text-slate-200 leading-snug line-clamp-3 font-semibold">{additionalTips}</p>
          </div>
          <div className="mt-1 pt-1 border-t border-amber-400/20 text-[9px] font-black text-amber-400 flex items-center justify-between">
            <span>Target: {category}</span>
            <span className="rounded bg-amber-400/20 px-1 text-[8px] text-amber-300 border border-amber-400/30">PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
};
