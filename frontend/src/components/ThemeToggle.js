// Example: src/components/ThemeToggle.js
import React from 'react';
import { useThemeMode } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  return (
    <button onClick={toggleTheme} style={{ marginLeft: 16 }}>
      {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

export default ThemeToggle;