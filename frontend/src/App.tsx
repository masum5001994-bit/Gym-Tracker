import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { LiveWorkout } from './pages/LiveWorkout';
import { Analytics } from './pages/Analytics';
import { FormGuide } from './pages/FormGuide';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { RestTimerProvider, useRestTimerContext } from './context/RestTimerContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { RestTimerWidget } from './components/RestTimerWidget';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthScreen } from './components/AuthScreen';
import { api } from './services/api';
import { UserProfile } from './types';

const GlobalTimer: React.FC = () => {
  const restTimer = useRestTimerContext();
  return (
    <RestTimerWidget
      secondsRemaining={restTimer.secondsRemaining}
      totalSeconds={restTimer.totalSeconds}
      isRunning={Boolean(restTimer.isRunning)}
      exerciseName={restTimer.exerciseName}
      progressPercent={restTimer.progressPercent}
      audioEnabled={restTimer.audioEnabled}
      onToggleAudio={restTimer.toggleAudio}
      onPause={restTimer.pauseTimer}
      onResume={restTimer.resumeTimer}
      onAddSeconds={restTimer.addSeconds}
      onSkip={restTimer.skipTimer}
      onPlayPreviewSound={() => restTimer.playBeep(880, 200)}
    />
  );
};

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user?.uid) {
      api
        .getUserProfile(user.uid)
        .then(setUserProfile)
        .catch(console.error);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <Activity className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-bold uppercase tracking-wider font-condensed">Loading BWS Gym Tracker...</p>
      </div>
    );
  }

  // IF USER IS NOT SIGNED IN -> SHOW ONLY SIGN IN SCREEN!
  if (!user) {
    return <AuthScreen />;
  }

  const needsOnboarding =
    Boolean(userProfile) &&
    (!userProfile?.isProfileSetupCompleted || !userProfile?.name || userProfile?.name.trim() === '');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 pt-4 sm:pt-6 pb-28 sm:pb-20">

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout/:id" element={<LiveWorkout />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/form-guide" element={<FormGuide />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        {/* First-Time Athlete Profile Setup Onboarding Modal */}
        {needsOnboarding && (
          <OnboardingModal
            onComplete={(updatedProfile) => {
              setUserProfile(updatedProfile);
            }}
          />
        )}

        <GlobalTimer />
      </div>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RestTimerProvider>
        <AppContent />
      </RestTimerProvider>
    </AuthProvider>
  );
};

export default App;
