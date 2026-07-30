import React, { useEffect, useState } from 'react';
import { User, Scale, Target, Flame, Edit3, Save, X, Activity, LogOut, LogIn, Dumbbell, Calendar, RotateCcw, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { triggerHaptic } from '../utils/haptics';
import { getCustomCycleDays, saveCustomCycleDays, resetCustomCycleDaysToDefault, CustomCycleDay } from '../utils/cycleCustomizer';

export const Profile: React.FC = () => {
  const { user, logout } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Cycle Customizer State
  const [cycleDays, setCycleDays] = useState<CustomCycleDay[]>(getCustomCycleDays());
  const [editingDay, setEditingDay] = useState<CustomCycleDay | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFocus, setEditFocus] = useState('');
  const [editExercises, setEditExercises] = useState<string[]>([]);


  // Form State
  const [name, setName] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(0);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(0);
  const [heightCm, setHeightCm] = useState<number>(0);
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number>(0);
  const [fitnessGoal, setFitnessGoal] = useState<'Hypertrophy' | 'Strength' | 'Fat Loss' | 'Recomp'>('Hypertrophy');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    api
      .getUserProfile(user?.uid)
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        setName(data.name);
        setCurrentWeightKg(data.currentWeightKg);
        setTargetWeightKg(data.targetWeightKg);
        setHeightCm(data.heightCm);
        setBodyFatPercentage(data.bodyFatPercentage || 15);
        setFitnessGoal(data.fitnessGoal);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    setSaving(true);

    try {
      const updated = await api.saveUserProfile(
        {
          name,
          currentWeightKg: Number(currentWeightKg),
          targetWeightKg: Number(targetWeightKg),
          heightCm: Number(heightCm),
          bodyFatPercentage: Number(bodyFatPercentage),
          fitnessGoal,
        },
        user?.uid
      );

      setProfile(updated);
      setIsEditing(false);

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#10b981'],
      });
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile updates.');
    } finally {
      setSaving(false);
    }
  };

  // Health Math Calculations
  const calculateBMI = () => {
    if (!currentWeightKg || !heightCm) return 0;
    const heightM = heightCm / 100;
    return parseFloat((currentWeightKg / (heightM * heightM)).toFixed(1));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    if (bmi <= 24.9) return { label: 'Optimal / Athletic', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (bmi <= 29.9) return { label: 'Overweight', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    return { label: 'High BMI', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const calculateTDEE = () => {
    if (!currentWeightKg || !heightCm) return 2200;
    const bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * 25 + 5;
    return Math.round(bmr * 1.55);
  };

  const calculateProteinTarget = () => {
    if (!currentWeightKg) return 160;
    return Math.round(currentWeightKg * 2.0);
  };

  const bmi = calculateBMI();
  const bmiCat = getBMICategory(bmi);
  const tdee = calculateTDEE();
  const proteinTarget = calculateProteinTarget();

  const weightDiff = profile ? profile.currentWeightKg - profile.targetWeightKg : 0;
  const isLossGoal = weightDiff > 0;

  const handleOpenDayEditor = (day: CustomCycleDay) => {
    setEditingDay(day);
    setEditTitle(day.title);
    setEditFocus(day.focus);
    setEditExercises([...day.exercisePreview]);
    triggerHaptic('light');
  };

  const handleSaveDayEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    triggerHaptic('success');
    const updatedDays = cycleDays.map((d) => {
      if (d.dayNum === editingDay.dayNum) {
        const cleanedExercises = editExercises.filter((ex) => ex.trim().length > 0);
        return {
          ...d,
          title: editTitle.trim() || d.title,
          focus: editFocus.trim() || d.focus,
          exercisePreview: cleanedExercises,
          exerciseCount: cleanedExercises.length,
        };
      }
      return d;
    });

    saveCustomCycleDays(updatedDays);
    setCycleDays(updatedDays);
    setEditingDay(null);

    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#FF9F0A', '#0A84FF', '#30D158'],
    });
  };

  const handleResetDays = () => {
    if (window.confirm('Reset all Day Titles and Exercise Names back to standard default Science routines?')) {
      triggerHaptic('warning');
      const defaults = resetCustomCycleDaysToDefault();
      setCycleDays(defaults);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Activity className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading BWS User Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 max-w-3xl mx-auto">
      {/* iOS Style Profile Card */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-blue-900/60 shadow-xl space-y-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-slate-100 shadow-lg shadow-blue-600/30 border border-blue-400/40 shrink-0">
              <User className="h-7 w-7 text-amber-400 stroke-[2.5]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-100 font-condensed tracking-wide uppercase truncate apple-display-title">
                  {profile?.name || user?.displayName || 'Science Athlete'}
                </h1>
                <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0">
                  {profile?.fitnessGoal}
                </span>
              </div>
              <p className="text-[11px] text-blue-400 font-semibold truncate">
                {profile?.heightCm} CM ({Math.floor((profile?.heightCm || 175) / 30.48)}'{Math.round(((profile?.heightCm || 175) / 2.54) % 12)}") • {profile?.currentWeightKg} KG {user?.email ? `• ${user.email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition apple-press shadow-md font-condensed uppercase tracking-wider shrink-0"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            {user ? (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  logout();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-2 text-xs font-black hover:bg-rose-500 hover:text-slate-950 transition apple-press font-condensed uppercase tracking-wider shrink-0"
                title="Sign Out of Account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-slate-100 hover:bg-blue-500 transition apple-press shadow-md font-condensed uppercase tracking-wider shrink-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Fitness Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center shadow-sm">
            <span className="text-[9px] font-black uppercase text-slate-400 block font-condensed">Current Weight</span>
            <span className="text-base font-black text-slate-100 font-mono">{profile?.currentWeightKg} <span className="text-[9px] text-slate-400">KG</span></span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center shadow-sm">
            <span className="text-[9px] font-black uppercase text-slate-400 block font-condensed">Target Weight</span>
            <span className="text-base font-black text-amber-400 font-mono">{profile?.targetWeightKg} <span className="text-[9px] text-slate-400">KG</span></span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center shadow-sm">
            <span className="text-[9px] font-black uppercase text-slate-400 block font-condensed">Daily TDEE</span>
            <span className="text-base font-black text-blue-400 font-mono">{tdee} <span className="text-[9px] text-slate-400">KCAL</span></span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center shadow-sm">
            <span className="text-[9px] font-black uppercase text-slate-400 block font-condensed">Daily Protein</span>
            <span className="text-base font-black text-emerald-400 font-mono">{proteinTarget} <span className="text-[9px] text-slate-400">G</span></span>
          </div>
        </div>
      </div>

      {/* NEW: 7-DAY WORKOUT CYCLE & EXERCISE CUSTOMIZER SETTINGS CARD */}
      <div className="rounded-3xl glass-panel p-5 border border-amber-400/40 shadow-xl space-y-4 bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Calendar className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100 font-condensed apple-display-title">
                DAY EXERCISE & ROUTINE CUSTOMIZER
              </h2>
              <p className="text-[10px] text-amber-400 font-semibold">Customize day titles & exercise movements</p>
            </div>
          </div>

          <button
            onClick={handleResetDays}
            className="flex items-center gap-1 text-[10px] font-black text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-xl border border-rose-500/30 uppercase tracking-wider font-condensed apple-press"
            title="Reset to default routine names"
          >
            <RotateCcw className="h-3 w-3 text-rose-400" />
            <span>Reset Names</span>
          </button>
        </div>

        {/* 7 Days List in Settings */}
        <div className="space-y-2">
          {cycleDays.map((day) => (
            <div
              key={day.dayNum}
              className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-amber-400/50 transition shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shrink-0">
                  {day.dayLabel}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide font-condensed truncate">
                    {day.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {day.exercisePreview.join(' • ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenDayEditor(day)}
                className="flex items-center gap-1 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl uppercase tracking-wider font-condensed apple-press shrink-0 shadow-sm"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Rename / Edit</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DAY & EXERCISE RENAME EDIT MODAL */}
      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 apple-glass-chrome p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 border border-amber-400/60 shadow-2xl space-y-4 apple-spring my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-amber-400 stroke-[2.5]" />
                <h3 className="text-sm sm:text-base font-black uppercase text-slate-100 font-condensed apple-display-title">
                  RENAME {editingDay.dayLabel} ({editingDay.title})
                </h3>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setEditingDay(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 apple-press"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDayEdits} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                  Day Title / Routine Name
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Upper Body & Arms"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Focus Description
                </label>
                <input
                  type="text"
                  required
                  value={editFocus}
                  onChange={(e) => setEditFocus(e.target.value)}
                  placeholder="e.g. Chest, Back & Shoulders"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 font-medium focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Exercises List Renamer */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-amber-400 font-condensed">
                    Movements & Exercise Names ({editExercises.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditExercises([...editExercises, 'New Exercise'])}
                    className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg uppercase font-condensed apple-press"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editExercises.map((exName, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 w-5 shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={exName}
                        onChange={(e) => {
                          const updated = [...editExercises];
                          updated[idx] = e.target.value;
                          setEditExercises(updated);
                        }}
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 font-bold focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editExercises.filter((_, i) => i !== idx);
                          setEditExercises(updated);
                        }}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 apple-press shrink-0"
                        title="Remove Exercise"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 apple-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 apple-press shadow-md uppercase tracking-wider font-condensed"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Day Renames</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* iOS Health Style Progress Gauge Card */}
      <div className="rounded-3xl glass-panel p-5 shadow-xl border border-blue-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Target className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-100 font-condensed apple-display-title">
              Target Weight Progress Gauge
            </h2>
          </div>
          <span className="text-[11px] font-mono font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/30">
            {Math.abs(weightDiff).toFixed(1)} KG {isLossGoal ? 'to Lose' : 'to Gain'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
            <span>Current: <strong className="text-slate-100 font-black">{profile?.currentWeightKg} KG</strong></span>
            <span className="text-amber-400">Goal: {profile?.targetWeightKg} KG</span>
          </div>

          {/* Visual iOS Gradient Progress Ring Bar */}
          <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-amber-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(10, 100 - Math.abs(weightDiff) * 8))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Health & Body Composition Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* BMI Card */}
        <div className="rounded-3xl glass-panel p-5 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Scale className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-xs font-black uppercase text-slate-100 font-condensed apple-display-title">Body Mass Index (BMI)</h3>
            </div>
            <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold border ${bmiCat.color}`}>
              {bmiCat.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-slate-100 font-mono">{bmi}</span>
            <span className="text-xs font-bold text-slate-400">kg/m²</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Standard body composition index calculated from height ({profile?.heightCm}cm) and weight ({profile?.currentWeightKg}kg).</p>
        </div>

        {/* BWS Scientific Nutrition Targets Card */}
        <div className="rounded-3xl glass-panel p-5 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <Flame className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-xs font-black uppercase text-slate-100 font-condensed apple-display-title">Scientific Fueling Targets</h3>
            </div>
            <span className="rounded-lg bg-blue-600/20 text-blue-400 px-2 py-0.5 text-[9px] font-bold border border-blue-500/30">
              BWS 2.0g/kg
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
            <div>
              <span className="text-[9px] text-slate-400 block font-sans font-bold">Maintenance Energy</span>
              <span className="text-lg font-black text-slate-100">{tdee} kcal</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-sans font-bold">Protein Target</span>
              <span className="text-lg font-black text-emerald-400">{proteinTarget} g/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 apple-glass-chrome p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-blue-900/80 shadow-2xl space-y-4 apple-spring">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-400 stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase text-slate-100 font-condensed apple-display-title">EDIT ATHLETE PROFILE</h3>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsEditing(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 apple-press"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Athlete Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Current Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Target Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Height (CM)</label>
                  <input
                    type="number"
                    required
                    value={heightCm || ''}
                    onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-amber-400 block mb-1">Feet (FT)</label>
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
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-amber-400 focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-amber-400 block mb-1">Inches (IN)</label>
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
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-amber-400 focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Primary Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
                >
                  <option value="Hypertrophy">Hypertrophy (Muscle Gain)</option>
                  <option value="Strength">Maximal Strength</option>
                  <option value="Fat Loss">Fat Loss & Definition</option>
                  <option value="Recomp">Body Recomposition</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 apple-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 apple-press shadow-md uppercase tracking-wider font-condensed"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Settings / Sign Out Card */}
      <div className="rounded-3xl glass-panel p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-100 font-condensed apple-display-title">Account & Authentication</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {user ? `Logged in as ${user.email || user.displayName}` : 'Guest mode (Local Device Account)'}
          </p>
        </div>

        {user ? (
          <button
            onClick={() => {
              triggerHaptic('medium');
              logout();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-rose-500 text-slate-950 px-4 py-2 text-xs font-black uppercase font-condensed tracking-wider hover:bg-rose-400 transition apple-press shadow-md"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => {
              triggerHaptic('medium');
              setAuthModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black uppercase font-condensed tracking-wider hover:bg-amber-300 transition apple-press shadow-md"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};


