import { useRef, useEffect, useCallback } from 'react';

export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delayMs: number,
): [(...args: Parameters<T>) => void, () => void] {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    cancel();
    timerRef.current = setTimeout(() => {
      callback(...args);
      timerRef.current = null;
    }, delayMs);
  }, [callback, delayMs, cancel]);

  return [debouncedFn, cancel];
}
