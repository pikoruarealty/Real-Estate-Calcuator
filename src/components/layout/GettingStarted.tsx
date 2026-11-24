'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

const KEY = 'gs-dismissed-v1';

const STEPS = [
  { n: 1, title: 'Enter the size', body: 'The carpet or super built-up area from the brochure. We show what you really get.' },
  { n: 2, title: 'Enter the price & charges', body: 'The rate per sq ft and the builder’s extra charges. We add GST, stamp duty and registration.' },
  { n: 3, title: 'See your loan', body: 'Your EMI, total interest, and how much cash you need to arrange yourself.' },
];

/** First-visit explainer. Dismissal is remembered on this device. */
export function GettingStarted({ onExample }: { onExample: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== '1');
    } catch {
      setShow(true);
    }
  }, []);
  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ }
  };
  if (!show) return null;
  return (
    <section aria-labelledby="gs-title" className="relative mb-4 rounded-xl border border-gold-muted/50 bg-gradient-to-br from-gold/10 to-transparent p-4 sm:p-5">
      <button type="button" onClick={dismiss} aria-label="Hide this guide" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text">✕</button>
      <h2 id="gs-title" className="pr-8 font-display text-xl text-text">Buying your first home? Here’s how this works.</h2>
      <p className="mt-1 text-sm leading-relaxed text-text-muted">
        A builder’s “₹6,500 per sq ft” is never the real price. In three steps we show the true size, the full cost with every tax and charge, and your monthly EMI.
      </p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-3 rounded-lg bg-bg/60 p-3">
            <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-semibold text-black">{s.n}</span>
            <span>
              <span className="block text-sm font-semibold">{s.title}</span>
              <span className="block text-xs leading-relaxed text-text-muted">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        <span aria-hidden className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gold-muted text-[11px] font-semibold text-gold-muted">i</span>
        Don’t know a word? Tap any ⓘ for a plain-English explanation, or open the Glossary at the top.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => { onExample(); dismiss(); }}>Show me a worked example</Button>
        <Button variant="secondary" onClick={dismiss}>Start with my own numbers</Button>
      </div>
    </section>
  );
}
