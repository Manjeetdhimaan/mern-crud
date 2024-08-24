import { useRef } from 'react';

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timer = useRef<number | null>(null);

  const debouncedFn = (...args: Parameters<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };

  return debouncedFn;
}

export default useDebounce;
