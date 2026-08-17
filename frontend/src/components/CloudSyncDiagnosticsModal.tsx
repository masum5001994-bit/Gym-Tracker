import React, { useState, useEffect } from 'react';
import { RefreshCw, Upload, Download, CheckCircle, User, Database, Smartphone, X } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { auth, db } from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { WorkoutLog } from '../types';
import {
  getCompletedDayNums,
  syncScheduleToCloud,
  syncScheduleFromCloud,
  reconcileScheduleFromLogs,
} from '../utils/cycleCompletion';
import { triggerHaptic } from '../utils/haptics';

interface CloudSyncDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2000): Promise<T | null> {
  let timer: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).then((res) => {
    clearTimeout(timer);
    return res;
  });
}

export const CloudSyncDiagnosticsModal: React.FC<CloudSyncDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Diagnostic Data
  const [localWorkouts, setLocalWorkouts] = useState<WorkoutLog[]>([]);
  const [cloudWorkouts, setCloudWorkouts] = useState<WorkoutLog[]>([]);
  const [localCompletedDays, setLocalCompletedDays] = useState<number[]>([]);
  const [cloudCompletedDays, setCloudCompletedDays] = useState<number[]>([]);

  const runDiagnostics = async () => {
    setStatusMsg(null);

    // 1. Instantly inspect Local Workouts (0ms delay)
    const uid = api.getCentralUserId(user?.uid);
    const storageKeys = [
      `bws_gym_tracker_workouts_${uid}`,
      `bws_gym_tracker_workouts_v1`,
      'bws_gym_tracker_workouts_v1',
    ];

    let localArr: WorkoutLog[] = [];
    storageKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localArr.push(...parsed);
        }
      } catch (e) {}
    });

    const map = new Map<string, WorkoutLog>();
    localArr.forEach((w) => map.set(w.id, w));
    const dedupedLocal = Array.from(map.values()).filter((w) => !(w as any).deleted);
    setLocalWorkouts(dedupedLocal);
    setLocalCompletedDays(getCompletedDayNums());
    setLoading(false);

    // 2. Query Cloud Workouts in background with strict 2s timeout
    const emailKey = auth.currentUser?.email
      ? auth.currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
      : null;
    const authUid = auth.currentUser?.uid || null;

    const targetUids = Array.from(new Set([uid, authUid, emailKey].filter(Boolean) as string[]));

    const cloudMap = new Map<string, WorkoutLog>();
    for (const tUid of targetUids) {
      try {
        const q = collection(db, 'users', tUid, 'workouts');
        const snap = (await withTimeout(getDocs(q), 2000)) as any;
        if (snap && !snap.empty) {
          snap.forEach((dSnap: any) => {
            const data = dSnap.data();
            if (data && !(data as any).deleted) {
              cloudMap.set(data.id, data as WorkoutLog);
            }
          });
        }

        // Read Schedule
        const schedRef = doc(db, 'users', tUid, 'profile', 'schedule');
        const schedSnap = (await withTimeout(getDoc(schedRef), 2000)) as any;
        if (schedSnap && schedSnap.exists()) {
          const sData = schedSnap.data();
          if (Array.isArray(sData.completedDayNums)) {
            setCloudCompletedDays(sData.completedDayNums);
          }
        }
      } catch (e) {
        console.warn('Cloud fetch note:', e);
      }
    }
    setCloudWorkouts(Array.from(cloudMap.values()));
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen, user]);

  const handleForceUpload = async () => {
    triggerHaptic('medium');
    setActionLoading(true);
    setStatusMsg('Pushing local workouts and schedule to Cloud Firestore...');
    try {
      await api.syncLocalWorkoutsToCloud(user?.uid);
      await syncScheduleToCloud(user?.uid);
      await runDiagnostics();
      setStatusMsg('✓ Successfully uploaded all local sessions to Cloud Firestore!');
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      setStatusMsg('Upload failed. Please check network connection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceDownload = async () => {
    triggerHaptic('medium');
    setActionLoading(true);
    setStatusMsg('Pulling workouts and schedule from Cloud Firestore...');
    try {
      await syncScheduleFromCloud(user?.uid);
      const logs = await api.getWorkouts(user?.uid);
      setLocalWorkouts(logs);
      const reconciled = reconcileScheduleFromLogs(logs);
      localStorage.setItem('bws_cycle_completed_day_nums_v1', JSON.stringify(reconciled));
      window.dispatchEvent(new Event('cycle_completion_updated'));
      await runDiagnostics();
      setStatusMsg(`✓ Downloaded ${logs.length} sessions! Completed Days: ${reconciled.length > 0 ? reconciled.join(', ') : 'None'}`);
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      setStatusMsg('Download failed. Please check network connection.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentEmail = user?.email || 'Anonymous Session (Not Logged In)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-panel-impeccable p-6 border border-gym-border shadow-2xl space-y-6 text-gym-text max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gym-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/20 border border-gym-primary text-gym-primary">
              <Database className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-gym-primary font-condensed">
                CLOUD SYNC DIAGNOSTICS
              </h2>
              <p className="text-xs text-gym-muted font-bold">Cross-Device Sync & Account Status</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-gym-card text-gym-muted hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Account Info */}
        <div className="p-3.5 rounded-2xl bg-gym-card border border-gym-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-gym-muted uppercase font-condensed">
            <User className="h-4 w-4 text-gym-secondary" />
            <span>ACTIVE LOGGED-IN ACCOUNT</span>
          </div>
          <p className="text-sm font-black text-slate-100 font-mono truncate bg-gym-bg p-2 rounded-xl border border-gym-border">
            {currentEmail}
          </p>
        </div>

        {/* Diagnostic Stats */}
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-gym-primary animate-spin mx-auto" />
            <p className="text-xs font-black uppercase text-gym-muted font-condensed tracking-wider">
              Inspecting Cloud Firestore & Local Device Storage...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Local Device */}
            <div className="p-4 rounded-2xl bg-gym-card border border-gym-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-gym-secondary uppercase font-condensed">
                  <Smartphone className="h-4 w-4" />
                  <span>THIS DEVICE</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-gym-secondary/20 text-gym-secondary border border-gym-secondary/40 font-mono">
                  {localWorkouts.length} Workouts
                </span>
              </div>
              <p className="text-xs text-gym-muted font-bold">
                Completed Days:{' '}
                <strong className="text-slate-100 font-mono">
                  {localCompletedDays.length > 0 ? `Day ${localCompletedDays.join(', Day ')}` : 'None'}
                </strong>
              </p>
            </div>

            {/* Cloud Firestore */}
            <div className="p-4 rounded-2xl bg-gym-card border border-gym-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase font-condensed">
                  <Database className="h-4 w-4" />
                  <span>CLOUD DATABASE</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  {cloudWorkouts.length} Workouts
                </span>
              </div>
              <p className="text-xs text-gym-muted font-bold">
                Completed Days:{' '}
                <strong className="text-slate-100 font-mono">
                  {cloudCompletedDays.length > 0 ? `Day ${cloudCompletedDays.join(', Day ')}` : 'None'}
                </strong>
              </p>
            </div>

          </div>
        )}

        {/* Status Message Alert */}
        {statusMsg && (
          <div className="p-3 rounded-xl bg-gym-primary/10 border border-gym-primary/40 text-xs font-bold text-gym-primary flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 border-t border-gym-border pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleForceUpload}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gym-primary text-slate-950 font-black text-xs uppercase font-condensed tracking-wider hover:opacity-90 transition apple-press shadow-lg border border-gym-primary"
            >
              <Upload className="h-4 w-4" />
              <span>UPLOAD TO CLOUD 🚀</span>
            </button>

            <button
              onClick={handleForceDownload}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gym-secondary text-slate-950 font-black text-xs uppercase font-condensed tracking-wider hover:opacity-90 transition apple-press shadow-lg border border-gym-secondary"
            >
              <Download className="h-4 w-4" />
              <span>DOWNLOAD TO DEVICE 📥</span>
            </button>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              runDiagnostics();
            }}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gym-card text-gym-muted hover:text-slate-200 text-xs font-bold transition border border-gym-border"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Check Status</span>
          </button>
        </div>

      </div>
    </div>
  );
};
