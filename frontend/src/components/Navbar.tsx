import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, History, BookOpen, Dumbbell, User, LogIn, LogOut } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

import { triggerHaptic } from '../utils/haptics';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthContext();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/form-guide', label: 'Library', icon: BookOpen },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 hidden md:block w-full border-b border-rose-950/60 apple-glass-chrome">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <NavLink to="/" className="flex items-center gap-3 group apple-press" onClick={() => triggerHaptic('light')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform border border-rose-400/40">
              <Dumbbell className="h-5 w-5 text-amber-300 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-slate-100 uppercase font-condensed apple-display-title">
                  BUILT WITH <span className="text-rose-500 font-extrabold">SCIENCE</span>
                </span>
                <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase border border-amber-300">
                  HIGHER VOLUME
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">14 Sets/Week Benchmark • KG</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => triggerHaptic('light')}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all apple-press ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30 border border-rose-400/50 font-extrabold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Auth Action Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <span className="text-xs font-black text-amber-400 font-condensed uppercase max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    logout();
                  }}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition apple-press"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 px-3.5 py-2 text-xs font-black transition apple-press shadow-md shadow-rose-500/25 font-condensed uppercase tracking-wider shrink-0 border border-rose-400/40"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top App Header */}
      <div className="md:hidden sticky top-0 z-40 w-full apple-glass-chrome border-b border-rose-950/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-500/30 border border-rose-400/40">
            <Dumbbell className="h-5 w-5 text-amber-300 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wider text-slate-100 font-condensed uppercase apple-display-title">
              BUILT WITH <span className="text-rose-500 font-extrabold">SCIENCE</span>
            </h1>
            <p className="text-[10px] text-amber-400 font-bold">Higher Volume • KG</p>
          </div>
        </div>

        {/* Mobile Auth Button */}
        {user ? (
          <button
            onClick={() => {
              triggerHaptic('medium');
              logout();
            }}
            className="flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-[10px] font-black text-amber-400 border border-slate-800 apple-press"
          >
            <span className="max-w-[70px] truncate">{user.displayName || 'User'}</span>
            <LogOut className="h-3 w-3 text-rose-400" />
          </button>
        ) : (
          <button
            onClick={() => {
              triggerHaptic('medium');
              setAuthModalOpen(true);
            }}
            className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-[10px] font-black text-rose-300 border border-rose-400/30 apple-press"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around apple-glass-chrome px-2 py-2 shadow-2xl border-t border-rose-500/30">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => triggerHaptic('light')}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all apple-press ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-rose-500 to-red-600 font-extrabold shadow-lg shadow-rose-500/30 scale-105 border border-rose-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>




      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
