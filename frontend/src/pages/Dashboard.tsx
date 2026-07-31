import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Trophy, Zap, Target, Flame, Activity } from 'lucide-react';
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
    // Reset volume matrix entries to 0 sets completed
    const resetMatrix: VolumeMatrixEntry[] = volumeMatrix.map((entry) => ({
      ...entry,
      completedSets: 0,
      percentage: 0,
      status: 'Low',
    }));
    setVolumeMatrix(resetMatrix);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto w-full px-1">
      {/* Full-Screen Prominent 7-Day Workout Progression Schedule */}
      <WeeklyScheduleCard />

      {/* PR Hall of Fame Card */}
      <PRHallOfFameCard workoutLogs={workoutLogs} />

      {/* 7-Day Muscle Volume Target Matrix with RESET Button */}
      <VolumeMatrixCard matrix={volumeMatrix} loading={loading} onResetVolume={handleResetVolume} />
    </div>
  );
};

export default Dashboard;
