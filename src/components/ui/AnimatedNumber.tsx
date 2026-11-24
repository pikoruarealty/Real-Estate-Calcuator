'use client';

import { useEffect, useRef, useState } from 'react';

/** Smoothly counts toward `value` (ease-out), starting from 0 on first show. Respects reduced motion. */
export function useTween(value: number, ms = 650): number {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = value;
      setV(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const cur = a + (value - a) * (1 - Math.pow(1 - k, 3));
      from.current = cur;
      setV(k < 1 ? cur : value);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

export function AnimatedNumber({ value, format, className, testId }: { value: number; format: (n: number) => string; className?: string; testId?: string }) {
  const v = useTween(value);
  return (
    <>
      <span aria-hidden className={className} data-testid={testId}>{format(Math.round(v))}</span>
      <span className="sr-only" aria-live="polite">{format(value)}</span>
    </>
  );
}
