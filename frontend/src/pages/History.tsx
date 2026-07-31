import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  Clock,
  Trophy,
  ChevronDown,
  ChevronUp,
  Trash2,
  RotateCcw,
  Search,
  Dumbbell,
  Flame,
  TrendingUp,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WorkoutLog } from '../types';
import { api } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '30days' | '7days'>('all');

  const fetchHistory = () => {
    setLoading(true);
    api
      .getWorkouts(user?.uid)
      .then((data) => setWorkouts(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const toggleExpand = (id: string) => {
    triggerHaptic('light');
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteWorkout = async (workoutId: string, title: string) => {
    if (window.confirm(`Delete log for "${title}"? This will remove volume and PRs associated with this log.`)) {
      triggerHaptic('warning');
      await api.deleteWorkout(workoutId, user?.uid);
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    }
  };

  // Lifetime Account Stats
  const validWorkouts = workouts.filter((w) => !(w as any).deleted);
  const totalSessions = validWorkouts.length;
  const totalVolumeKg = validWorkouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0);
  const totalPRs = validWorkouts.reduce((acc, w) => acc + (w.prCount || 0), 0);
  const totalMinutes = validWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Search & Filter
  const filteredWorkouts = validWorkouts.filter((w) => {
    const matchesSearch =
      !searchQuery.trim() ||
      w.routineTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.exerciseLogs?.some((el) => el.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterPeriod === 'all') return true;

    const workoutDate = new Date(w.date);
    const now = new Date();
    const diffDays = (now.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24);

    if (filterPeriod === '7days') return diffDays <= 7;
    if (filterPeriod === '30days') return diffDays <= 30;

    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER & LIFETIME ACCOUNT SUMMARY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-400 shadow-md">
              <HistoryIcon className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-100 font-condensed tracking-wider leading-none glow-text">
                ACCOUNT LOG HISTORY
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium pt-1">
                Central Account Audit Trail & Workout Archive
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              fetchHistory();
            }}
            className="flex items-center gap-1.5 text-xs font-black text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 rounded-xl border border-cyan-500/30 uppercase tracking-wider font-condensed transition apple-press shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* ACCOUNT LIFETIME STATS METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl glass-panel p-4 border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/30 space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Total Sessions</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">{totalSessions}</div>
          </div>

          <div className="rounded-2xl glass-panel p-4 border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/30 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="h-4 w-4" />
              <span>Volume Lifted</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {totalVolumeKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">KG</span>
            </div>
          </div>

          <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/30 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="h-4 w-4" />
              <span>PRs Broken</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalPRs}</div>
          </div>

          <div className="rounded-2xl glass-panel p-4 border border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950/30 space-y-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="h-4 w-4" />
              <span>Time Trained</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
              {totalHours} <span className="text-sm font-normal text-slate-400">HRS</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by routine or exercise name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
          {(['all', '30days', '7days'] as const).map((period) => (
            <button
              key={period}
              onClick={() => {
                triggerHaptic('light');
                setFilterPeriod(period);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                filterPeriod === period
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {period === 'all' ? 'All Time' : period === '30days' ? 'Last 30 Days' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* WORKOUT LOGS LIST */}
      {loading ? (
        <div className="py-16 text-center text-sm font-semibold text-slate-400 flex flex-col items-center justify-center gap-3">
          <Dumbbell className="h-8 w-8 text-cyan-400 animate-spin" />
          <span>Fetching central account log history...</span>
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 rounded-3xl glass-panel p-8 border border-slate-800 space-y-3">
          <HistoryIcon className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="font-bold text-slate-300">No workout logs found.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery ? 'No workouts match your search query.' : 'Complete your first workout session from the 7-Day Schedule to start building your account log history!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map((w) => {
            const isExpanded = expandedId === w.id;
            const formattedDate = new Date(w.date).toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={w.id}
                className="rounded-3xl glass-panel p-4 sm:p-5 border border-slate-800/90 space-y-4 hover:border-slate-700 transition bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/60 shadow-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div onClick={() => toggleExpand(w.id)} className="cursor-pointer min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md font-mono">
                        LOGGED SESSION
                      </span>
                      <h3 className="text-base sm:text-lg font-black uppercase text-slate-100 font-condensed tracking-wide">
                        {w.routineTitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" /> {w.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {(w.totalVolumeKg || 0).toLocaleString()} KG
                      </span>
                      {w.prCount > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-500/40">
                          <Trophy className="h-3 w-3 text-amber-400" /> {w.prCount} PRs
                        </span>
                      )}
                    </div>

                    {/* Re-Log Button */}
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        navigate(`/workout/${w.routineId || 'custom-session'}`);
                      }}
                      className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition active:scale-95 shadow-sm"
                      title="Re-log this session"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    {/* Delete Workout Log Button */}
                    <button
                      onClick={() => handleDeleteWorkout(w.id, w.routineTitle)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition active:scale-95 shadow-sm"
                      title="Delete log entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(w.id)}
                      className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Exercise Logs */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3 animate-fade-in">
                    {w.exerciseLogs && w.exerciseLogs.length > 0 ? (
                      w.exerciseLogs.map((el, elIdx) => (
                        <div key={elIdx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                          <h4 className="text-xs sm:text-sm font-black uppercase text-cyan-400 font-condensed tracking-wide">
                            {el.exerciseName}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {el.sets && el.sets.length > 0 ? (
                              el.sets.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono border shadow-sm ${
                                    s.isPR
                                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                                      : 'bg-slate-900 text-slate-200 border-slate-800'
                                  }`}
                                >
                                  <span className="text-slate-400 font-bold">SET {s.setNum}:</span>
                                  <strong className="text-slate-100">{s.weightKg} kg</strong> × {s.reps} reps
                                  {s.isPR && <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">No set detail recorded</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic">No exercises logged in this entry.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


