import React from 'react';
import { X, ShieldAlert, Sparkles, RefreshCw, SkipForward, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../utils/haptics';

interface AdaptiveRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysIdle: number;
  activeDayTitle: string;
  routineId: string;
}

export const AdaptiveRecoveryModal: React.FC<AdaptiveRecoveryModalProps> = ({
  isOpen,
  onClose,
  daysIdle,
  activeDayTitle,
  routineId,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isMiniDeload = daysIdle >= 2 && daysIdle <= 4;
  const isModerateGap = daysIdle >= 5 && daysIdle <= 6;
  const isExtendedGap = daysIdle >= 7;

  const handleStartWorkout = (rampBack: boolean = false) => {
    triggerHaptic('medium');
    onClose();
    if (rampBack) {
      sessionStorage.setItem('bws_ramp_back_mode', 'true');
    } else {
      sessionStorage.removeItem('bws_ramp_back_mode');
    }
    navigate(`/workout/${routineId || 'custom-session'}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gym-card border border-gym-border p-5 sm:p-7 shadow-2xl space-y-5 text-gym-text">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gym-border pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-950 shadow-md ${
                isExtendedGap
                  ? 'bg-amber-400 border-amber-300'
                  : isModerateGap
                  ? 'bg-cyan-400 border-cyan-300'
                  : 'bg-gym-primary border-gym-primary'
              }`}
            >
              {isExtendedGap ? (
                <ShieldAlert className="h-6 w-6 stroke-[2.5]" />
              ) : (
                <Zap className="h-6 w-6 stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-gym-bg border border-gym-border text-gym-secondary">
                {daysIdle} DAYS IDLE DETECTED
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase font-condensed tracking-wider text-gym-primary pt-0.5">
                Scientific Adaptive Coach
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-gym-bg text-gym-muted hover:text-gym-text border border-gym-border transition apple-press"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Science Breakdown Card */}
        <div className="rounded-2xl p-4 bg-gym-bg border border-gym-border space-y-2">
          <div className="flex items-center gap-2 text-gym-secondary text-xs font-black uppercase tracking-wider font-condensed">
            <Sparkles className="h-4 w-4" />
            <span>Hypertrophy Physiology Insight</span>
          </div>

          {isMiniDeload && (
            <p className="text-xs sm:text-sm text-gym-text leading-relaxed font-semibold">
              <strong>Zero muscle loss occurred!</strong> Missing {daysIdle} days served as an unintentional{' '}
              <span className="text-gym-primary font-bold">mini-deload</span>. Your muscle glycogen is replenished and
              joint fatigue is zero. You are prime to return stronger!
            </p>
          )}

          {isModerateGap && (
            <p className="text-xs sm:text-sm text-gym-text leading-relaxed font-semibold">
              <strong>Your CNS is fully refreshed.</strong> After {daysIdle} days rest, resume your scheduled routine
              without trying to "double up" lost workouts—junk volume degrades hypertrophy quality.
            </p>
          )}

          {isExtendedGap && (
            <p className="text-xs sm:text-sm text-gym-text leading-relaxed font-semibold">
              <strong>Repeated Bout Effect (RBE) Guard:</strong> Taking {daysIdle} days off reduces micro-damage
              protection. To prevent debilitating DOMS (soreness), use our <strong>80% Ramp-Back Mode</strong> for
              your first session back.
            </p>
          )}
        </div>

        {/* Action Strategy Recommendations */}
        <div className="space-y-2.5 pt-1">
          <label className="text-xs font-black uppercase tracking-wider text-gym-muted font-condensed block">
            Recommended Action Plan:
          </label>

          {/* Strategy Option 1: Pick Up Where Left Off (Primary) */}
          <button
            onClick={() => handleStartWorkout(false)}
            className="w-full text-left p-3.5 rounded-2xl bg-gym-primary text-slate-950 font-black flex items-center justify-between gap-3 shadow-lg apple-press border border-gym-primary hover:opacity-90 transition"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 stroke-[2.5] shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-extrabold uppercase font-condensed block">
                  1. Pick Up Where You Left Off ({activeDayTitle})
                </span>
                <span className="text-[10px] opacity-80 block font-normal">
                  Standard volume • 100% Progressive Overload Target
                </span>
              </div>
            </div>
            <span className="text-xs font-black uppercase font-mono px-2 py-0.5 bg-slate-950 text-gym-primary rounded-lg shrink-0">
              RECOMMENDED
            </span>
          </button>

          {/* Strategy Option 2: 80% Smart Ramp-Back Mode */}
          {isExtendedGap && (
            <button
              onClick={() => handleStartWorkout(true)}
              className="w-full text-left p-3.5 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-between gap-3 shadow-md apple-press border border-amber-300 hover:bg-amber-300 transition"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 stroke-[2.5] shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-extrabold uppercase font-condensed block">
                    2. Activate 80% Smart Ramp-Back (RIR 2-3)
                  </span>
                  <span className="text-[10px] opacity-80 block font-normal">
                    Caps sets to prevent extreme soreness & protect tendons
                  </span>
                </div>
              </div>
              <span className="text-xs font-black uppercase font-mono px-2 py-0.5 bg-slate-950 text-amber-400 rounded-lg shrink-0">
                SAFE RETURN
              </span>
            </button>
          )}

          {/* Strategy Option 3: Skip & Move On */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
              navigate(`/workout/${routineId || 'custom-session'}`);
            }}
            className="w-full text-left p-3 rounded-2xl bg-gym-bg text-gym-muted hover:text-gym-text border border-gym-border font-bold flex items-center justify-between gap-2 transition apple-press text-xs"
          >
            <div className="flex items-center gap-2.5">
              <SkipForward className="h-4 w-4 shrink-0" />
              <span>Skip Missed Session & Continue Next Priority</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
