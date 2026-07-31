import React, { useState } from 'react';
import { X, Disc, Dumbbell, Flame, Check, Sparkles } from 'lucide-react';
import { calculatePlates, calculateWarmupSets } from '../utils/plateCalculator';
import { triggerHaptic } from '../utils/haptics';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightKg?: number;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeightKg = 100,
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeightKg || 100);
  const [barWeight, setBarWeight] = useState<number>(20);

  if (!isOpen) return null;

  const result = calculatePlates(targetWeight, barWeight);
  const warmups = calculateWarmupSets(targetWeight, barWeight);

  const getPlateColor = (weight: number) => {
    switch (weight) {
      case 25:
        return 'bg-red-600 text-white border-red-400';
      case 20:
        return 'bg-blue-600 text-white border-blue-400';
      case 15:
        return 'bg-amber-500 text-slate-950 border-amber-300';
      case 10:
        return 'bg-emerald-600 text-white border-emerald-400';
      case 5:
        return 'bg-purple-600 text-white border-purple-400';
      case 2.5:
        return 'bg-slate-300 text-slate-950 border-white';
      default:
        return 'bg-slate-700 text-slate-200 border-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-5 sm:p-6 border-2 border-amber-400/50 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-400 shadow-md">
              <Disc className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-amber-400 font-condensed tracking-wider leading-none">
                PLATE & WARMUP CALCULATOR
              </h2>
              <p className="text-xs text-slate-300 pt-0.5">Barbell Plate Loader & Neural Warmup Pyramid</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Weight (KG)</label>
            <input
              type="number"
              step="2.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-400/40 text-lg font-black text-amber-400 font-mono focus:outline-none focus:border-amber-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Barbell (KG)</label>
            <select
              value={barWeight}
              onChange={(e) => setBarWeight(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value={20}>20 KG (Olympic Bar)</option>
              <option value={15}>15 KG (Women Olympic)</option>
              <option value={10}>10 KG (EZ Curl / Technique)</option>
            </select>
          </div>
        </div>

        {/* VISUAL PLATE LOADER DISPLAY */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Per Side Load ({result.weightPerSideKg} KG)</span>
            <span className="text-amber-400">Total: {targetWeight} KG</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-4 min-h-[80px] bg-slate-900/90 rounded-xl border border-slate-800/80 px-4 overflow-x-auto">
            {/* Left Collar Barbell Representation */}
            <div className="h-4 w-12 bg-slate-600 rounded-l-md border-r-4 border-slate-500 shrink-0" title="Barbell Sleeve" />

            {/* Plates Loaded on One Side */}
            {result.platesPerSide.length === 0 ? (
              <span className="text-xs text-slate-500 font-medium italic">Empty Bar (Just {barWeight} KG)</span>
            ) : (
              result.platesPerSide.map((plate, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg border-2 font-mono font-black text-xs shadow-md shrink-0 transition-transform ${getPlateColor(
                    plate
                  )}`}
                  style={{
                    height: `${Math.min(100, 50 + plate * 1.8)}px`,
                  }}
                >
                  <span>{plate}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 justify-center">
            {result.platesPerSide.map((plate, idx) => (
              <span key={idx} className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800">
                1× {plate} KG
              </span>
            ))}
          </div>
        </div>

        {/* NEURAL WARMUP SET PYRAMID */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>Recommended Warmup Pyramid</span>
          </div>

          <div className="space-y-2">
            {warmups.map((w) => (
              <div key={w.setNum} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-xs text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-md">
                    WARMUP {w.setNum}
                  </span>
                  <div>
                    <span className="font-mono font-black text-slate-100 text-sm">{w.weightKg} KG</span>
                    <span className="text-slate-400 ml-2">× {w.reps} reps ({w.percent}%)</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 italic hidden sm:inline">{w.note}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('success');
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-sm hover:bg-amber-300 transition apple-press shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
};
