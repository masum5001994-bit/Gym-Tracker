import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Trophy, Dumbbell, Zap, Flame, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Exercise, ExerciseHistoryPoint, PRHallOfFameEntry, OverloadDeltaEntry } from '../types';
import { api } from '../services/api';

export const Analytics: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [historyData, setHistoryData] = useState<ExerciseHistoryPoint[]>([]);
  const [maxWeightKg, setMaxWeightKg] = useState<number>(0);
  const [max1RM, setMax1RM] = useState<number>(0);
  const [prHallOfFame, setPrHallOfFame] = useState<PRHallOfFameEntry[]>([]);
  const [overloadDeltas, setOverloadDeltas] = useState<OverloadDeltaEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getExercises(),
      api.getPRHallOfFame(),
      api.getProgressiveOverloadDeltas(),
    ])
      .then(([exList, prs, deltas]) => {
        setExercises(exList);
        setPrHallOfFame(prs);
        setOverloadDeltas(deltas);
        if (exList.length > 0) {
          setSelectedExerciseId(exList[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedExerciseId) return;
    api
      .getExerciseHistory(selectedExerciseId)
      .then((res) => {
        setHistoryData(res.history);
        setMaxWeightKg(res.maxWeightKg);
        setMax1RM(res.maxEstimated1RM);
      })
      .catch(console.error);
  }, [selectedExerciseId]);

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const formattedChartData = historyData.map((pt) => ({
    date: new Date(pt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weightKg: pt.maxWeightKg,
    estimated1RM: pt.estimated1RM,
    reps: pt.maxReps,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-extrabold text-slate-100 glow-text uppercase font-condensed tracking-wide">
            Progressive Overload Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          Track your all-time PR records, session-to-session strength gains (+KG / +Reps), and 1RM progression curves.
        </p>
      </div>

      {/* 🏆 ALL-TIME PR HALL OF FAME */}
      <div className="rounded-3xl glass-panel p-5 sm:p-6 shadow-xl border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/20">
              <Trophy className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 uppercase font-condensed tracking-wide flex items-center gap-2">
                All-Time PR Hall of Fame
              </h2>
              <p className="text-[11px] text-amber-400 font-bold">Your heaviest loads & peak estimated 1RM records</p>
            </div>
          </div>

          <span className="rounded-xl bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-400 uppercase font-mono">
            {prHallOfFame.length} REVIEWS
          </span>
        </div>

        {prHallOfFame.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/50 border border-slate-800">
            <Dumbbell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <span>No PR records logged yet. Complete workout sessions to populate your PR Hall of Fame!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prHallOfFame.slice(0, 6).map((pr, idx) => (
              <div
                key={pr.exerciseId + idx}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-400/50 transition-all shadow-md space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-[9px] font-bold text-slate-300 border border-slate-800">
                    {pr.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {new Date(pr.dateAchieved).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-100 uppercase font-condensed tracking-wide line-clamp-1">
                  {pr.exerciseName}
                </h3>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Max Weight</span>
                    <span className="text-base font-black text-amber-400 font-mono">{pr.maxWeightKg} KG</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase text-cyan-400 block">Peak 1RM</span>
                    <span className="text-base font-black text-cyan-300 font-mono">{pr.estimated1RM} KG</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⚡ PROGRESSIVE OVERLOAD DELTA TRACKER */}
      <div className="rounded-3xl glass-panel p-5 sm:p-6 shadow-xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-slate-100 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 uppercase font-condensed tracking-wide flex items-center gap-2">
                Session-to-Session Overload Tracker
              </h2>
              <p className="text-[11px] text-cyan-400 font-bold">Exercise-by-exercise gains (+KG / +Reps) vs previous session</p>
            </div>
          </div>
        </div>

        {overloadDeltas.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/50 border border-slate-800">
            <Flame className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <span>Complete at least two workout sessions to track session-to-session progressive overload!</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {overloadDeltas.map((delta, idx) => {
              const isGain = delta.oneRMDeltaKg > 0 || delta.weightDeltaKg > 0;
              const isLower = delta.oneRMDeltaKg < 0 && delta.weightDeltaKg < 0;

              return (
                <div
                  key={delta.exerciseId + idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-100 uppercase font-condensed tracking-wide">
                        {delta.exerciseName}
                      </span>
                      <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-slate-800">
                        {delta.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                      <span>Latest: <strong className="text-amber-400 font-black">{delta.latestWeightKg} KG</strong> × {delta.latestReps}r</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">Prev: {delta.previousWeightKg} KG</span>
                    </div>
                  </div>

                  {/* Gains Badges */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {delta.weightDeltaKg !== 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono font-black border ${
                        delta.weightDeltaKg > 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {delta.weightDeltaKg > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {delta.weightDeltaKg > 0 ? `+${delta.weightDeltaKg} KG` : `${delta.weightDeltaKg} KG`}
                      </span>
                    )}

                    {delta.oneRMDeltaKg !== 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono font-black border ${
                        delta.oneRMDeltaKg > 0
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {delta.oneRMDeltaKg > 0 ? `+${delta.oneRMDeltaKg} KG 1RM` : `${delta.oneRMDeltaKg} KG 1RM`}
                      </span>
                    )}

                    {isGain && (
                      <span className="rounded-xl bg-amber-400 text-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider font-condensed">
                        🔥 GAIN
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exercise 1RM & Weight Progression Chart Section */}
      <div className="rounded-3xl glass-panel p-5 sm:p-6 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-100 uppercase font-condensed tracking-wide flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" /> Exercise Strength Progression Curve
            </h2>
            <p className="text-xs text-slate-400 font-semibold">Select an exercise to analyze historical performance & estimated 1RM</p>
          </div>

          {/* Exercise Dropdown */}
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full sm:w-auto rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm font-black uppercase font-condensed tracking-wide text-cyan-300 focus:outline-none focus:border-cyan-500 min-h-[48px] touch-manipulation shadow-md"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.category})
              </option>
            ))}
          </select>
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-800/80">
            <span className="text-xs text-slate-400 font-bold uppercase">Max Weight Logged</span>
            <p className="text-2xl font-black text-slate-100 mt-1 font-mono">
              {maxWeightKg} <span className="text-sm text-slate-400 font-medium">KG</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-slate-800/80">
            <span className="text-xs text-slate-400 font-bold uppercase">Peak Estimated 1RM (Epley)</span>
            <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">
              {max1RM} <span className="text-sm text-slate-400 font-medium">KG</span>
            </p>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="h-80 w-full pt-4">
          {formattedChartData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
              <Dumbbell className="h-8 w-8 text-slate-600 mb-2" />
              <span>No completed workout history recorded for {selectedExercise?.name} yet.</span>
              <span className="text-[11px] text-slate-600 mt-1">
                Complete a workout containing this exercise to render strength progression curves.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} unit=" kg" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="estimated1RM"
                  name="Estimated 1RM (Epley)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#38bdf8' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  name="Max Weight (KG)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

