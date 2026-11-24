'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalculatorProvider, useApp } from '@/state/CalculatorContext';
import { Header, type NavSection } from '@/components/layout/Header';
import { track } from '@/lib/analytics';
import { Hero } from '@/components/layout/Hero';
import { Tabs, type TabId } from '@/components/layout/Tabs';
import { Footer } from '@/components/layout/Footer';
import { StickyTotalBar } from '@/components/layout/StickyTotalBar';
import { GlossaryDialog } from '@/components/layout/GlossaryDialog';
import { AdvisorDialog } from '@/components/advisor/AdvisorDialog';
import { AreaTab } from './AreaTab';
import { CostTab } from './CostTab';
import { LoanTab } from './LoanTab';

function Toast() {
  const { notice, clearNotice } = useApp();
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(clearNotice, 6000);
    return () => clearTimeout(t);
  }, [notice, clearNotice]);
  if (!notice) return null;
  return (
    <div role="status" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-2xl bg-surface-2 px-4 py-3 text-sm shadow-2xl ring-1 ring-white/10">
      {notice}
      <button type="button" onClick={clearNotice} className="ml-3 text-gold underline">Dismiss</button>
    </div>
  );
}

function Shell() {
  const { input, result, loadExample, reset, load, advisorOpen, setAdvisorOpen } = useApp();
  const [undo, setUndo] = useState<null | typeof input>(null);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 7000);
    return () => clearTimeout(t);
  }, [undo]);
  const startOver = () => {
    setUndo(input);
    reset();
    goTo('area');
  };
  const [tab, setTab] = useState<TabId>('area');
  const [glossary, setGlossary] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);

  const goTo = useCallback((t: TabId) => {
    setTab(t);
    requestAnimationFrame(() => {
      const el = anchor.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const navActive: NavSection = glossary ? 'glossary' : advisorOpen ? 'advisor' : 'calculator';
  const navigate = (sNav: NavSection) => {
    if (sNav === 'calculator') {
      setGlossary(false);
      setAdvisorOpen(false);
      anchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sNav === 'glossary') {
      setAdvisorOpen(false);
      setGlossary(true);
    } else {
      setGlossary(false);
      track('advisor_open');
      setAdvisorOpen(true);
    }
  };

  const done: Record<TabId, boolean> = {
    area: result.area.carpetSqft != null || result.area.sbuSqft != null,
    cost: result.cost != null,
    loan: result.loan != null,
  };

  return (
    <>
      <Header active={navActive} onNavigate={navigate} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero onExample={() => { loadExample(); goTo('cost'); }} />
        <div ref={anchor} className="scroll-mt-2" />
        <Tabs active={tab} onChange={goTo} done={done} onReset={startOver} />
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-3">
          {tab === 'area' && <AreaTab onNext={() => goTo('cost')} />}
          {tab === 'cost' && <CostTab onNext={() => goTo('loan')} onBack={() => goTo('area')} />}
          {tab === 'loan' && <LoanTab onBack={() => goTo('cost')} />}
        </div>
      </main>
      <Footer onNavigate={navigate} />
      <StickyTotalBar onSeeCost={() => goTo('cost')} />
      <AdvisorDialog />
      <GlossaryDialog open={glossary} onClose={() => setGlossary(false)} />
      <Toast />
      {undo && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-full bg-text py-2 pl-5 pr-2 text-sm text-black shadow-2xl md:bottom-8">
          <span>Everything cleared</span>
          <button
            type="button"
            onClick={() => { load(undo); setUndo(null); }}
            className="min-h-9 rounded-full bg-black px-4 text-sm font-semibold text-text"
          >
            Undo
          </button>
        </div>
      )}
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
