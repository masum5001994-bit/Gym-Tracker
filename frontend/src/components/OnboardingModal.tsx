import React, { useState, useEffect } from 'react';
import { Dumbbell, Save, Activity, Target, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(75);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [fitnessGoal, setFitnessGoal] = useState<'Hypertrophy' | 'Strength' | 'Fat Loss' | 'Recomp'>('Hypertrophy');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const savedProfile = await api.saveUserProfile({
        name: name.trim(),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg),
        heightCm: Number(heightCm),
        fitnessGoal,
        isProfileSetupCompleted: true,
      });

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#eab308', '#10b981'],
      });

      onComplete(savedProfile);
    } catch (err) {
      console.error('Failed to complete onboarding setup:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-5 sm:p-6 border border-blue-900/80 shadow-2xl space-y-5 my-auto bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900">
        {/* Onboarding Header */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl shadow-blue-600/30 border border-blue-400/40 mx-auto">
            <Dumbbell className="h-7 w-7 text-amber-400 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-wider text-slate-100 uppercase font-condensed">
              WELCOME TO <span className="text-amber-400">BUILT WITH SCIENCE</span>
            </h2>
            <p className="text-xs text-blue-400 font-semibold mt-0.5">
              Set up your athlete metrics to unlock personalized training benchmarks & calorie calculations.
            </p>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
              Your Name / Athlete Tag <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                Current Weight (KG) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="75.0"
                  value={currentWeightKg || ''}
                  onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-500">KG</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                Target Weight (KG) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="70.0"
                  value={targetWeightKg || ''}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-500">KG</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                Height (CM) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  placeholder="175"
                  value={heightCm || ''}
                  onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs font-mono font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                Feet (FT)
              </label>
              <input
                type="number"
                min={3}
                max={8}
                value={Math.floor((heightCm || 175) / 30.48)}
                onChange={(e) => {
                  const newFt = parseInt(e.target.value, 10) || 0;
                  const curIn = Math.round(((heightCm || 175) / 2.54) % 12);
                  setHeightCm(Math.round((newFt * 12 + curIn) * 2.54));
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs font-mono font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                Inches (IN)
              </label>
              <input
                type="number"
                min={0}
                max={11}
                value={Math.round(((heightCm || 175) / 2.54) % 12)}
                onChange={(e) => {
                  const curFt = Math.floor((heightCm || 175) / 30.48);
                  const newIn = parseInt(e.target.value, 10) || 0;
                  setHeightCm(Math.round((curFt * 12 + newIn) * 2.54));
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs font-mono font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
              Primary Fitness Goal
            </label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value as any)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              <option value="Hypertrophy">Hypertrophy (Muscle)</option>
              <option value="Strength">Max Strength</option>
              <option value="Fat Loss">Fat Loss</option>
              <option value="Recomp">Recomposition</option>
            </select>
          </div>


          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20 font-condensed uppercase tracking-wider"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving Profile...' : 'START MY TRAINING'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
