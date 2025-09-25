import { useMemo, useRef } from 'react';

export default function useDebounce(
  fn: (...a: any[]) => void,
  delay: number,
  maxWait?: number,
) {
  const t = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  return useMemo(
    () =>
      (...args: any[]) => {
        const now = Date.now();
        if (start.current == null) start.current = now;

        if (t.current) clearTimeout(t.current as any);

        // maxWait 강제 실행
        if (maxWait && start.current && now - start.current >= maxWait) {
          start.current = now;
          fn(...args);
          return;
        }
        t.current = window.setTimeout(() => {
          start.current = null;
          fn(...args);
        }, delay);
      },
    [fn, delay, maxWait],
  );
}
