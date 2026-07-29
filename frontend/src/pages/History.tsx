import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, Clock, Trophy, ChevronDown, ChevronUp, Trash2, RotateCcw } from 'lucide-react';
import { WorkoutLog } from '../types';
import { api } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

export const History: React.FC = () => {
  const { user } = useAuthContext();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = () => {
    setLoading(true);
    api
      .getWorkouts(user?.uid)
      .then(setWorkouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Uncomplete / delete this logged workout session? This will remove set volume.')) {
      await api.deleteWorkout(workoutId, user?.uid);
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-extrabold text-slate-100 glow-text">Workout Session History</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Review past workouts, set volume, or uncomplete mistakenly finished sessions.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading workout history...</div>
      ) : workouts.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No completed workouts recorded yet. Start a session from the Dashboard!
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((w) => {
            const isExpanded = expandedId === w.id;
            return (
              <div key={w.id} className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div onClick={() => toggleExpand(w.id)} className="cursor-pointer min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-100">{w.routineTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                        {new Date(w.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" /> {w.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-100">{w.totalVolumeKg} KG</span>
                      {w.prCount > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                          <Trophy className="h-3 w-3 text-amber-400" /> {w.prCount} PRs
                        </span>
                      )}
                    </div>

                    {/* Uncomplete Workout Button */}
                    <button
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="p-2 rounded-xl bg-slate-900 text-slate-500 hover:text-rose-400 border border-slate-800 transition active:scale-95"
                      title="Uncomplete / Delete Workout Log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button onClick={() => toggleExpand(w.id)} className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
                    {w.exerciseLogs.map((el) => (
                      <div key={el.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <h4 className="text-xs font-bold text-cyan-300 mb-2">{el.exerciseName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {el.sets.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono border ${
                                s.isPR
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              <span>Set {s.setNum}:</span>
                              <strong>{s.weightKg} kg</strong> × {s.reps} reps
                              {s.isPR && <Trophy className="h-3 w-3 text-amber-400" />}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
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

