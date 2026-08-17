import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Trophy, Target, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { AnalyticsSummary, VolumeMatrixEntry, WorkoutLog } from '../types';
import { api } from '../services/api';
import { VolumeMatrixCard } from '../components/VolumeMatrixCard';
import { WeeklyScheduleCard } from '../components/WeeklyScheduleCard';
import { PRHallOfFameCard } from '../components/PRHallOfFameCard';
import { useAuthContext } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [volumeMatrix, setVolumeMatrix] = useState<VolumeMatrixEntry[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion Expand States (collapsed by default for zero overwhelm)
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([api.getAnalyticsSummary(), api.getVolumeMatrix(), api.getWorkouts(user?.uid)])
      .then(([sData, vData, wLogs]) => {
        setSummary(sData);
        setVolumeMatrix(vData);
        setWorkoutLogs(wLogs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleResetVolume = () => {
    const resetMatrix: VolumeMatrixEntry[] = volumeMatrix.map((entry) => ({
      ...entry,
      completedSets: 0,
      percentage: 0,
      status: 'Low',
    }));
    setVolumeMatrix(resetMatrix);
  };

  return (
    <div className="space-y-6 pb-28 max-w-7xl mx-auto w-full px-3 sm:px-6">
      {/* Primary Hero Focus: 7-Day Workout Schedule */}
      <WeeklyScheduleCard />

      {/* Collapsible Deep Analytics Accordion */}
      <div className="rounded-3xl glass-panel-impeccable p-4 sm:p-5 border border-gym-border shadow-xl space-y-4">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full flex items-center justify-between text-left apple-press"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gym-primary/20 text-gym-primary border border-gym-primary/40">
              <BarChart2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase text-gym-primary font-condensed tracking-wider apple-display-title">
                DEEP TRAINING ANALYTICS & PR RECORDS
              </h2>
              <p className="text-[11px] text-gym-muted font-bold">
                {showAnalytics ? 'Click to collapse analytics' : '7-Day Muscle Volume Target & PR Hall of Fame'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-950 bg-gym-secondary px-2.5 py-1 rounded-lg">
              {showAnalytics ? 'HIDE' : 'VIEW ANALYTICS'}
            </span>
            {showAnalytics ? (
              <ChevronUp className="h-5 w-5 text-gym-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gym-muted" />
            )}
          </div>
        </button>

        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-3 border-t border-gym-border animate-in fade-in duration-200">
            {/* PR Hall of Fame Card */}
            <PRHallOfFameCard workoutLogs={workoutLogs} />

            {/* 7-Day Muscle Volume Target Matrix */}
            <VolumeMatrixCard matrix={volumeMatrix} loading={loading} onResetVolume={handleResetVolume} />
          </div>
        )}
      </div>
    </div>
  );
};



export default Dashboard;
