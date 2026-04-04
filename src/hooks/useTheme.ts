import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'email-compiler-theme';

export function useTheme() {
  const [mode, setMode] = useLocalStorage<ThemeMode>(STORAGE_KEY, 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      if (mode === 'system') {
        setResolvedTheme(mq.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(mode);
      }
    };

    updateResolved();

    mq.addEventListener('change', updateResolved);
    return () => mq.removeEventListener('change', updateResolved);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const cycleTheme = useCallback(() => {
    setMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, [setMode]);

  return { mode, resolvedTheme, cycleTheme };
}
