import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME_SCHEMES, ThemeId, ThemeScheme } from '../types/theme';

interface ThemeContextType {
  activeTheme: ThemeScheme;
  setTheme: (themeId: ThemeId) => void;
  allThemes: ThemeScheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bws_gym_active_theme_id';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as ThemeId;
    if (saved && THEME_SCHEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return 'solar-blaze';
  });

  const activeTheme = THEME_SCHEMES.find((t) => t.id === activeThemeId) || THEME_SCHEMES[1];

  const applyThemeToDOM = (theme: ThemeScheme) => {
    const root = document.documentElement;

    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-card', theme.card);
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-muted', theme.muted);
    root.style.setProperty('--color-border', theme.border);

    // Apply body background and text color directly
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;

    if (theme.isLight) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  };

  useEffect(() => {
    applyThemeToDOM(activeTheme);
  }, [activeThemeId]);

  const setTheme = (themeId: ThemeId) => {
    const found = THEME_SCHEMES.find((t) => t.id === themeId);
    if (found) {
      setActiveThemeId(themeId);
      localStorage.setItem(LOCAL_STORAGE_KEY, themeId);
      applyThemeToDOM(found);
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, allThemes: THEME_SCHEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
