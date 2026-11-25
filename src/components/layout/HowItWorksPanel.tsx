'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/state/LanguageContext';
import { SidePanel } from './SidePanel';

const LABELS = {
  en: { step: 'Step', expand: 'View full screen', collapse: 'Exit full screen', close: 'Close' },
  gu: { step: 'પગલું', expand: 'પૂર્ણ સ્ક્રીનમાં જુઓ', collapse: 'પૂર્ણ સ્ક્રીનમાંથી બહાર નીકળો', close: 'બંધ કરો' },
};

/* ---------- Icons ---------- */
function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {children}
    </svg>
  );
}
const SlidersIcon = () => <Svg><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></Svg>;
const CalculatorIcon = () => (
  <Svg>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
  </Svg>
);
const CheckCircleIcon = () => <Svg><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></Svg>;
const InfoIcon = () => <Svg size={18}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></Svg>;
const ZapIcon = () => <Svg><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></Svg>;
const ArrowIcon = () => <Svg size={16}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
const ExpandIcon = () => <Svg size={16}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></Svg>;
const CollapseIcon = () => <Svg size={18}><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></Svg>;
const CloseIcon = () => <Svg size={16}><path d="M18 6 6 18M6 6l12 12" /></Svg>;

const STEP_ICONS = { 1: <SlidersIcon />, 2: <CalculatorIcon />, 3: <CheckCircleIcon /> } as const;
type StepN = 1 | 2 | 3;
const STEPS: StepN[] = [1, 2, 3];

/* ---------- Helpers ---------- */
function Reveal({ i, children, className = '' }: { i: number; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${i * 120}ms` }}
    >
      {children}
    </div>
  );
}

/** Full-screen overlay shell: glow header, Esc to close, page scroll locked. Rendered only while open. */
function FullScreenShell({
  titleId, title, subtitle, exitLabel, closeLabel, onExit, onClose, children,
}: {
  titleId: string;
  title: string;
  subtitle?: string;
  exitLabel: string;
  closeLabel: string;
  onExit: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const el = ref.current;
    if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.animate(
        [{ opacity: 0, transform: 'scale(0.98)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 300, easing: 'ease-out' },
      );
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const btn =
    'flex h-10 w-10 items-center justify-center rounded-full text-text-muted ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:text-gold hover:ring-gold/50 active:scale-95';

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 outline-none backdrop-blur-2xl"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(212,175,55,0.14),transparent)]" />
      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/30">
            <ZapIcon />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
            {subtitle && <p className="truncate text-[13px] text-text-muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onExit} aria-label={exitLabel} title={exitLabel} className={btn}><CollapseIcon /></button>
          <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel} className={btn}><CloseIcon /></button>
        </div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>,
    document.body,
  );
}

/* ---------- Cards ---------- */
function StepCard({ n, full }: { n: StepN; full: boolean }) {
  const { t } = useT();
  return (
    <article
      className={`group relative h-full overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-black/30 hover:ring-gold/40 motion-reduce:transform-none ${
        full ? 'p-6' : 'p-4'
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-4 select-none text-7xl font-bold tabular-nums text-white/[0.04] transition-colors duration-500 group-hover:text-gold/10"
      >
        0{n}
      </span>
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20 transition duration-300 group-hover:scale-105 group-hover:bg-gold group-hover:text-black motion-reduce:transform-none">
          {STEP_ICONS[n]}
        </span>
        <h3 className={`font-semibold leading-snug ${full ? 'text-lg' : 'text-[15px]'}`}>{t(`how.${n}.t`)}</h3>
      </div>
      <p className={`relative mt-3 leading-relaxed text-text-muted ${full ? 'text-[15px]' : 'text-sm'}`}>{t(`how.${n}.d`)}</p>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-gold/0 transition-transform duration-500 group-hover:scale-x-100" />
    </article>
  );
}

function NoteCard() {
  const { t } = useT();
  return (
    <div className="flex gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
      <span className="mt-0.5 text-gold"><InfoIcon /></span>
      <p className="text-[13px] leading-relaxed text-text-muted">{t('how.note')}</p>
    </div>
  );
}

function StartButton({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full bg-gold px-6 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30 active:translate-y-0 active:scale-95 motion-reduce:transform-none"
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-[200%] motion-reduce:hidden" />
      <span className="relative">{t('how.start')}</span>
      <span className="relative transition-transform duration-300 group-hover:translate-x-1"><ArrowIcon /></span>
    </button>
  );
}

/* ---------- Side-panel layout: vertical timeline ---------- */
function CompactView({ onStart, onExpand, expandLabel }: { onStart: () => void; onExpand: () => void; expandLabel: string }) {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
      <div className="flex justify-end pb-3">
        <button
          type="button"
          onClick={onExpand}
          className="inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-[13px] text-text-muted ring-1 ring-white/10 transition-all duration-300 hover:text-gold hover:ring-gold/50 active:scale-95"
        >
          <ExpandIcon />
          {expandLabel}
        </button>
      </div>

      <ol>
        {STEPS.map((n, i) => (
          <li key={n}>
            <Reveal i={i} className="flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-black shadow-md shadow-gold/20">{n}</span>
                {i < STEPS.length - 1 && <span aria-hidden className="mt-2 w-px flex-1 bg-gradient-to-b from-gold/50 to-transparent" />}
              </div>
              <div className="min-w-0 flex-1"><StepCard n={n} full={false} /></div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal i={3} className="mt-2"><NoteCard /></Reveal>
      <Reveal i={4} className="mt-5"><StartButton onClick={onStart} /></Reveal>
    </div>
  );
}

/* ---------- Full-screen layout: 3 cards in a row ---------- */
function FullView({ onStart, stepLabel }: { onStart: () => void; stepLabel: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
        <span aria-hidden className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-5 hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent md:block" />
        {STEPS.map((n, i) => (
          <li key={n}>
            <Reveal i={i} className="flex h-full flex-col items-center gap-4">
              <span className="relative z-10 inline-flex h-10 items-center gap-2 rounded-full bg-gold px-4 text-sm font-bold text-black shadow-lg shadow-gold/20">
                {stepLabel} {n}
              </span>
              <div className="w-full flex-1"><StepCard n={n} full /></div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal i={3} className="mx-auto mt-10 max-w-2xl"><NoteCard /></Reveal>
      <Reveal i={4} className="mt-8 flex justify-center"><StartButton onClick={onStart} /></Reveal>
    </div>
  );
}

export function HowItWorksPanel({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart: () => void }) {
  const { t, lang } = useT();
  const L = lang === 'gu' ? LABELS.gu : LABELS.en;
  const [full, setFull] = useState(false);
  const fullTitleId = useId();

  // Reopening always starts in the side panel.
  useEffect(() => {
    if (!open) setFull(false);
  }, [open]);

  const start = () => {
    setFull(false);
    onStart();
  };

  return (
    <>
      <SidePanel open={open && !full} onClose={onClose} titleId="how-title" title={t('how.title')} subtitle={t('how.sub')}>
        <CompactView onStart={start} onExpand={() => setFull(true)} expandLabel={L.expand} />
      </SidePanel>

      {open && full && (
        <FullScreenShell
          titleId={fullTitleId}
          title={t('how.title')}
          subtitle={t('how.sub')}
          exitLabel={L.collapse}
          closeLabel={L.close}
          onExit={() => setFull(false)}
          onClose={onClose}
        >
          <FullView onStart={start} stepLabel={L.step} />
        </FullScreenShell>
      )}
    </>
  );
}