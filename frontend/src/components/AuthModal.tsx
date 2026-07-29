import React, { useState } from 'react';
import { LogIn, UserPlus, X, Mail, Lock, User, AlertCircle, Dumbbell } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthContext } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useAuthContext();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUpMode) {
        if (!name.trim()) {
          setError('Please enter your athlete name.');
          setLoading(false);
          return;
        }
        await signup(email.trim(), password, name.trim());
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#eab308', '#10b981'],
        });
      } else {
        await login(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-blue-900/80 shadow-2xl space-y-4 bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-amber-400 shadow-md">
              <Dumbbell className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-slate-100 font-condensed tracking-wider">
                {isSignUpMode ? 'CREATE ATHLETE PROFILE' : 'ATHLETE LOGIN'}
              </h3>
              <p className="text-[10px] text-blue-400 font-bold">Access your unique gym logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-100 active:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsSignUpMode(false);
              setError('');
            }}
            className={`py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all font-condensed ${
              !isSignUpMode ? 'bg-blue-600 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUpMode(true);
              setError('');
            }}
            className={`py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all font-condensed ${
              isSignUpMode ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUpMode && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Athlete Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                />
                <User className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="athlete@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              />
              <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              />
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300 active:scale-95 transition-all shadow-md uppercase tracking-wider font-condensed mt-2"
          >
            {isSignUpMode ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span>{loading ? 'Processing...' : isSignUpMode ? 'Create Account' : 'Sign In to Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
