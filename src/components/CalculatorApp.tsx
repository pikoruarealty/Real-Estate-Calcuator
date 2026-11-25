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
import { HowItWorksPanel } from '@/components/layout/HowItWorksPanel';
import { HelpBanner, useHelpBanner } from '@/components/layout/HelpBanner';
import { LanguageProvider, useT } from '@/state/LanguageContext';
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
  const [how, setHow] = useState(false);
  const { t } = useT();
  const banner = useHelpBanner();
  const anchor = useRef<HTMLDivElement>(null);

  const goTo = useCallback((t: TabId) => {
    setTab(t);
    requestAnimationFrame(() => {
      const el = anchor.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const openGlossary = () => {
    setAdvisorOpen(false);
    setHow(false);
    setGlossary(true);
    banner.dismiss(); // they found the glossary, so the hint has done its job
  };

  const navActive: NavSection = glossary ? 'glossary' : how ? 'how' : advisorOpen ? 'advisor' : 'calculator';
  const navigate = (sNav: NavSection) => {
    if (sNav === 'calculator') {
      setGlossary(false);
      setHow(false);
      setAdvisorOpen(false);
      anchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sNav === 'glossary') {
      openGlossary();
    } else if (sNav === 'how') {
      setAdvisorOpen(false);
      setGlossary(false);
      setHow(true);
    } else {
      setGlossary(false);
      setHow(false);
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
        <Hero onExample={() => { loadExample(); goTo('cost'); }} onHow={() => navigate('how')} />
        <section ref={anchor} id="calculator" aria-label={t('nav.calculator')} className="scroll-mt-4">
          {banner.show && <HelpBanner onOpen={openGlossary} onDismiss={banner.dismiss} />}
          <Tabs active={tab} onChange={goTo} done={done} onReset={startOver} />
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'area' && <AreaTab onNext={() => goTo('cost')} />}
            {tab === 'cost' && <CostTab onNext={() => goTo('loan')} onBack={() => goTo('area')} />}
            {tab === 'loan' && <LoanTab onBack={() => goTo('cost')} />}
          </div>
        </section>
      </main>
      <Footer onNavigate={navigate} />
      <StickyTotalBar onSeeCost={() => goTo('cost')} />
      <AdvisorDialog />
      <GlossaryDialog open={glossary} onClose={() => setGlossary(false)} />
      <HowItWorksPanel open={how} onClose={() => setHow(false)} onStart={() => navigate('calculator')} />
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
    <LanguageProvider>
      <CalculatorProvider>
        <Shell />
      </CalculatorProvider>
    </LanguageProvider>
  );
}
