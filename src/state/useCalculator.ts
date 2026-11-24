'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculate } from '@/engine';
import type { AreaInput, CalculatorInput, CalculatorResult, CostInput, LoanInput } from '@/engine/types';
import { track } from '@/lib/analytics';
import { defaultInput, exampleInput } from './defaults';
import { decodeInput, encodeInput, shareUrl as buildShareUrl } from './urlState';

export interface CalculatorApi {
  input: CalculatorInput;
  result: CalculatorResult;
  setArea: (patch: Partial<AreaInput>) => void;
  setCost: (patch: Partial<CostInput>) => void;
  setLoan: (patch: Partial<LoanInput>) => void;
  loadExample: () => void;
  reset: () => void;
  shareUrl: string;
  /** one-shot message to show in a toast (e.g. invalid shared link) */
  notice: string | null;
  clearNotice: () => void;
  hydrated: boolean;
}

export function useCalculator(): CalculatorApi {
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [origin, setOrigin] = useState('');
  const tracked = useRef(false);

  // Restore from URL on first load.
  useEffect(() => {
    setOrigin(window.location.origin);
    const s = new URLSearchParams(window.location.search).get('s');
    if (s) {
      const decoded = decodeInput(s);
      if (decoded) setInput(decoded);
      else setNotice('That shared link could not be read, so we loaded a blank calculator.');
    }
    setHydrated(true);
  }, []);

  const result = useMemo(() => calculate(input), [input]);

  // Keep the URL in sync (debounced 500 ms).
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      const isBlank = JSON.stringify(input) === JSON.stringify(defaultInput());
      if (isBlank) url.searchParams.delete('s');
      else url.searchParams.set('s', encodeInput(input));
      window.history.replaceState(null, '', url.toString());
    }, 500);
    return () => clearTimeout(t);
  }, [input, hydrated]);

  useEffect(() => {
    if (result.cost && !tracked.current) {
      tracked.current = true;
      track('calc_complete');
    }
  }, [result.cost]);

  const setArea = useCallback((patch: Partial<AreaInput>) => setInput((i) => ({ ...i, area: { ...i.area, ...patch } })), []);
  const setCost = useCallback((patch: Partial<CostInput>) => setInput((i) => ({ ...i, cost: { ...i.cost, ...patch } })), []);
  const setLoan = useCallback((patch: Partial<LoanInput>) => setInput((i) => ({ ...i, loan: { ...i.loan, ...patch } })), []);
  const loadExample = useCallback(() => setInput(exampleInput()), []);
  const reset = useCallback(() => setInput(defaultInput()), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const shareUrl = useMemo(() => (origin ? buildShareUrl(input, origin) : ''), [input, origin]);

  return { input, result, setArea, setCost, setLoan, loadExample, reset, shareUrl, notice, clearNotice, hydrated };
}
