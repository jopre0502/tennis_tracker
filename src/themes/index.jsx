import { useState, useEffect, createContext, useContext } from 'react';
import React from 'react';
import { modernTennis } from './modernTennis';
import { wimbledon } from './wimbledon';
import { usOpen } from './usOpen';
import { classicGreen } from './classicGreen';

// Theme Registry
export const THEMES = {
  'modern-tennis': modernTennis,
  'wimbledon': wimbledon,
  'us-open': usOpen,
  'classic-green': classicGreen,
};

// Default Theme
export const DEFAULT_THEME_ID = 'classic-green';

// Theme Context
export const ThemeContext = createContext();

/**
 * useTheme Hook
 * Manages theme selection and persistence
 */
export const useTheme = () => {
  const [currentThemeId, setCurrentThemeId] = useState(DEFAULT_THEME_ID);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('tennolino-theme');
    if (savedThemeId && THEMES[savedThemeId]) {
      setCurrentThemeId(savedThemeId);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tennolino-theme', currentThemeId);
  }, [currentThemeId]);

  const changeTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  const currentTheme = THEMES[currentThemeId];

  return {
    currentTheme,
    currentThemeId,
    changeTheme,
    availableThemes: Object.values(THEMES),
  };
};

/**
 * ThemeProvider Component
 * Wraps app to provide theme context
 */
export const ThemeProvider = ({ children }) => {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useThemeContext Hook
 * Access theme from context
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
