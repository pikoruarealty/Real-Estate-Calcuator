'use client';

import { useEffect, useState } from 'react';
import { CalculatorProvider, useApp } from '@/state/CalculatorContext';
import { Header } from '@/components/layout/Header';
import { Tabs, type TabId } from '@/components/layout/Tabs';
import { Footer } from '@/components/layout/Footer';
import { StickyTotalBar } from '@/components/layout/StickyTotalBar';
import { AdvisorDialog } from '@/components/advisor/AdvisorDialog';
import { Button } from '@/components/ui/Button';
import { AreaTab } from './AreaTab';
import { CostTab } from './CostTab';
import { LoanTab } from './LoanTab';

function Toolbar() {
  const { loadExample, reset } = useApp();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3">
      <p className="text-sm text-text-muted">Results update as you type. Nothing is saved on our servers.</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={loadExample}>Example</Button>
        <Button variant="ghost" onClick={reset}>Reset</Button>
      </div>
    </div>
  );
}

function Toast() {
  const { notice, clearNotice } = useApp();
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(clearNotice, 6000);
    return () => clearTimeout(t);
  }, [notice, clearNotice]);
  if (!notice) return null;
  return (
    <div role="status" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-lg border border-warn/60 bg-surface-2 px-4 py-3 text-sm shadow-xl">
      {notice}
      <button type="button" onClick={clearNotice} className="ml-3 text-gold underline">Dismiss</button>
    </div>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>('area');
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-4">
        <Toolbar />
        <Tabs active={tab} onChange={setTab} />
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-4">
          {tab === 'area' && <AreaTab />}
          {tab === 'cost' && <CostTab />}
          {tab === 'loan' && <LoanTab />}
        </div>
      </main>
      <Footer />
      <StickyTotalBar />
      <AdvisorDialog />
      <Toast />
    </>
  );
}

export function CalculatorApp() {
  return (
    <CalculatorProvider>
      <Shell />
    </CalculatorProvider>
  );
}
