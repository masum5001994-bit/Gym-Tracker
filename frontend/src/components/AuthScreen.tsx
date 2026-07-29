import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Dumbbell, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthContext } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { login, signup } = useAuthContext();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#eab308', '#10b981'],
        });
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to authenticate. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-blue-900/80 shadow-2xl space-y-6 bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900">
        {/* BWS Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl shadow-blue-600/30 border border-blue-400/40 mx-auto">
            <Dumbbell className="h-8 w-8 text-amber-400 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-100 uppercase font-condensed">
              BUILT WITH <span className="text-amber-400">SCIENCE</span>
            </h1>
            <p className="text-xs text-blue-400 font-bold mt-0.5 uppercase tracking-wider">
              14 Sets/Week Science Benchmark • KG
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsSignUpMode(false);
              setError('');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all font-condensed ${
              !isSignUpMode ? 'bg-blue-600 text-slate-100 shadow-md border border-blue-400/30' : 'text-slate-400 hover:text-slate-200'
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
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all font-condensed ${
              isSignUpMode ? 'bg-amber-400 text-slate-950 shadow-md border border-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUpMode && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">Athlete Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
                />
                <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="athlete@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
              />
              <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
              />
              <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-xs font-black text-slate-950 hover:bg-amber-300 active:scale-95 transition-all shadow-lg shadow-amber-500/20 font-condensed uppercase tracking-wider mt-3"
          >
            {loading ? (
              <Activity className="h-4 w-4 animate-spin text-slate-950" />
            ) : isSignUpMode ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span>{loading ? 'Authenticating...' : isSignUpMode ? 'CREATE MY ATHLETE ACCOUNT' : 'SIGN IN TO MY ATHLETE PROFILE'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
