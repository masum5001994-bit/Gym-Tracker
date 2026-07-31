import React from 'react';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/haptics';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { activeTheme, setTheme, allThemes } = useThemeContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#1b1b1e] border border-[#2e2e33] p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e2e33]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b00] to-[#ffd600] text-slate-950 shadow-md">
              <Palette className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-wider font-condensed flex items-center gap-2">
                Color Schemes <Sparkles className="h-4 w-4 text-[#ffd600]" />
              </h2>
              <p className="text-xs text-[#a0a0a6]">Select your preferred workout color palette (8 Themes)</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 text-[#a0a0a6] hover:text-slate-100 border border-[#2e2e33] transition apple-press"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-4 overflow-y-auto pr-1">
          {allThemes.map((theme) => {
            const isSelected = activeTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  triggerHaptic('medium');
                  setTheme(theme.id);
                }}
                className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all apple-press border ${
                  isSelected
                    ? 'ring-2 ring-[#ff6b00] border-[#ff6b00] shadow-lg scale-[1.02]'
                    : 'border-[#2e2e33] hover:border-slate-600'
                }`}
                style={{ backgroundColor: theme.card }}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm uppercase font-condensed tracking-wider" style={{ color: theme.text }}>
                        {theme.name}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#ff6b00] text-slate-950">
                          <Check className="h-3 w-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.secondary }}>
                      {theme.tagline}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] mb-3 leading-snug line-clamp-2" style={{ color: theme.muted }}>
                  {theme.bestFor}
                </p>

                {/* Color Palette Preview Swatches */}
                <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: theme.border }}>
                  <div
                    className="h-5 w-8 rounded-md shadow-sm border border-black/20 flex items-center justify-center text-[9px] font-black"
                    style={{ backgroundColor: theme.primary, color: '#000' }}
                    title="Primary Accent"
                  >
                    PRI
                  </div>
                  <div
                    className="h-5 w-8 rounded-md shadow-sm border border-black/20 flex items-center justify-center text-[9px] font-black"
                    style={{ backgroundColor: theme.secondary, color: '#000' }}
                    title="Secondary Accent"
                  >
                    SEC
                  </div>
                  <div
                    className="h-5 w-8 rounded-md shadow-sm border border-white/10"
                    style={{ backgroundColor: theme.bg }}
                    title="Background"
                  />
                  <div
                    className="h-5 w-8 rounded-md shadow-sm border border-white/10"
                    style={{ backgroundColor: theme.card }}
                    title="Card Surface"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2e2e33] flex justify-end">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ff6b00] text-slate-950 font-black uppercase font-condensed text-xs tracking-wider hover:bg-[#e66000] transition apple-press shadow-md shadow-[#ff6b00]/25"
          >
            Done • Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
