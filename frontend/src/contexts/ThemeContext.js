import React, { createContext, useContext, useState, useEffect } from 'react';
import theme from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProviderCustom = ({ children }) => {
  // Load theme mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Merge the correct color palette
  const mergedTheme = {
    ...theme,
    colors: mode === 'dark' ? theme.darkColors : theme.colors,
    mode,
  };

  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme: mergedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);