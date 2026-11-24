'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useCalculator, type CalculatorApi } from './useCalculator';

interface Ctx extends CalculatorApi {
  advisorOpen: boolean;
  setAdvisorOpen: (o: boolean) => void;
}

const C = createContext<Ctx | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const calc = useCalculator();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  return <C.Provider value={{ ...calc, advisorOpen, setAdvisorOpen }}>{children}</C.Provider>;
}

export function useApp(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error('useApp must be used inside CalculatorProvider');
  return v;
}
