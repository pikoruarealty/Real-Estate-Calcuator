'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY, GLOSSARY_GROUPS } from '@/content/glossary';
import { useT } from '@/state/LanguageContext';
import { SidePanel } from './SidePanel';

type Row = [string, (typeof GLOSSARY)[keyof typeof GLOSSARY]];

/* Small UI labels kept local so no i18n file changes are needed. */
const LABELS = {
  en: {
    all: 'All',
    terms: 'terms',
    more: 'More detail',
    less: 'Show less',
    expand: 'Full screen',
    collapse: 'Exit full screen',
    close: 'Close',
    clear: 'Clear search',
  },
  gu: {
    all: 'બધા',
    terms: 'શબ્દો',
    more: 'વધુ વિગત',
    less: 'ઓછું બતાવો',
    expand: 'પૂર્ણ સ્ક્રીન',
    collapse: 'પૂર્ણ સ્ક્રીનમાંથી બહાર નીકળો',
    close: 'બંધ કરો',
    clear: 'શોધ સાફ કરો',
  },
};

/* ---------- Icons ---------- */
function Svg({ children, size = 18, className = '' }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}
const SearchIcon = ({ className }: { className?: string }) => (
  <Svg className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <Svg size={16} className={className}><path d="M18 6 6 18M6 6l12 12" /></Svg>
);
const ExpandIcon = () => (
  <Svg><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></Svg>
);
const CollapseIcon = () => (
  <Svg><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></Svg>
);
const ChevronIcon = ({ className }: { className?: string }) => (
  <Svg size={14} className={className}><path d="m6 9 6 6 6-6" /></Svg>
);
const BookIcon = () => (
  <Svg size={20}>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Svg>
);

/* ---------- Helpers ---------- */

/** Fade + rise in on mount, staggered by index. */
function Reveal({ i, children }: { i: number; children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <li
      className={`transition-all duration-500 ease-out motion-reduce:transition-none ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      style={{ transitionDelay: `${Math.min(i, 12) * 40}ms` }}
    >
      {children}
    </li>
  );
}

/** Wraps search matches in a gold highlight. */
function Highlight({ text, needle }: { text: string; needle: string }) {
  if (!needle) return <>{text}</>;
  const re = new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return (
    <>
      {text.split(re).map((part, idx) =>
        idx % 2 === 1 ? (
          <mark key={idx} className="rounded bg-gold/25 px-0.5 text-inherit">{part}</mark>
        ) : (
          <span key={idx}>{part}</span>
        ),
      )}
    </>
  );
}

function useLabels() {
  const { lang } = useT();
  return lang === 'gu' ? LABELS.gu : LABELS.en;
}

/* ---------- One glossary card ---------- */
function Entry({ row, needle, full }: { row: Row; needle: string; full: boolean }) {
  const L = useLabels();
  const [, e] = row;
  const [manual, setManual] = useState<boolean | null>(null);
  const bodyId = useId();

  // If the search only matches the extra text, open the card so the match is visible.
  const autoOpen =
    !!needle &&
    !!e.extra &&
    e.extra.toLowerCase().includes(needle) &&
    !`${e.term} ${e.tip}`.toLowerCase().includes(needle);
  const open = manual ?? autoOpen;
  const letter = Array.from(e.term.trim())[0]?.toUpperCase() ?? '•';

  return (
    <article className="group h-full rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05] hover:ring-gold/40 hover:shadow-lg hover:shadow-black/20 motion-reduce:transform-none">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-sm font-semibold text-gold ring-1 ring-gold/20 transition duration-300 group-hover:scale-105 group-hover:bg-gold group-hover:text-black motion-reduce:transform-none">
          {letter}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className={`font-semibold leading-snug ${full ? 'text-base' : 'text-[15px]'}`}>
            <Highlight text={e.term} needle={needle} />
          </h4>
          <p className={`mt-1 leading-relaxed text-text-muted ${full ? 'text-[15px]' : 'text-sm'}`}>
            <Highlight text={e.tip} needle={needle} />
          </p>

          {e.extra && (
            <>
              <div
                id={bodyId}
                className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                  open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="mt-2 rounded-xl border-l-2 border-gold/60 bg-gold/[0.06] px-3 py-2 text-sm leading-relaxed text-text-muted">
                    <Highlight text={e.extra} needle={needle} />
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() => setManual(!open)}
                className="mt-2 inline-flex min-h-8 items-center gap-1 rounded-full text-xs font-medium text-gold transition hover:brightness-125"
              >
                {open ? L.less : L.more}
                <ChevronIcon className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- Search + filters + list (shared by panel and full screen) ---------- */
function Content({
  q, setQ, needle, group, setGroup, counts, rows, full, onExpand,
}: {
  q: string;
  setQ: (v: string) => void;
  needle: string;
  group: string | null;
  setGroup: (g: string | null) => void;
  counts: Record<string, number>;
  rows: Row[];
  full: boolean;
  onExpand?: () => void;
}) {
  const { t } = useT();
  const L = useLabels();
  const inputId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);
  const pad = full ? 'px-4 sm:px-6' : 'px-5 sm:px-6';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [group]);

  return (
    <>
      {/* Search */}
      <div className={`flex items-center gap-2 pb-3 ${pad}`}>
        <div className="group relative flex-1">
          <label htmlFor={inputId} className="sr-only">{t('glossary.searchLabel')}</label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-300 group-focus-within:text-gold" />
          <input
            id={inputId}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('glossary.search')}
            className="h-11 w-full rounded-xl bg-surface-2 pl-11 pr-10 text-base ring-1 ring-transparent transition placeholder:text-text-muted/50 focus:outline-none focus-visible:ring-gold/70 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label={L.clear}
            tabIndex={q ? 0 : -1}
            className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-white/10 hover:text-text ${
              q ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'
            }`}
          >
            <XIcon />
          </button>
        </div>
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            aria-label={L.expand}
            title={L.expand}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-muted ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:text-gold hover:ring-gold/50 active:scale-95"
          >
            <ExpandIcon />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div
        className={`flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${pad}`}
        role="group"
        aria-label="Filter"
      >
        {[null, ...GLOSSARY_GROUPS].map((g) => {
          const n = g === null ? totalAll : counts[g] ?? 0;
          if (g !== null && n === 0 && group !== g) return null;
          const on = group === g;
          return (
            <button
              key={g ?? '__all'}
              type="button"
              aria-pressed={on}
              onClick={() => setGroup(g)}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-all duration-300 active:scale-95 motion-reduce:transform-none ${
                on
                  ? 'bg-gold text-black shadow-md shadow-gold/20'
                  : 'bg-white/5 text-text-muted hover:-translate-y-px hover:bg-white/10 hover:text-text'
              }`}
            >
              {g ?? L.all}
              <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${on ? 'bg-black/15' : 'bg-white/10'}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div ref={scrollRef} className={`min-h-0 flex-1 overflow-y-auto pb-6 ${pad}`}>
        <p className="mb-1 text-xs text-text-muted" aria-live="polite">
          {rows.length} {L.terms}
        </p>

        {GLOSSARY_GROUPS.map((g) => {
          if (group !== null && group !== g) return null;
          const list = rows.filter(([, e]) => e.group === g);
          if (!list.length) return null;
          return (
            <section key={g} className="mb-6">
              <div className="mb-3 mt-3 flex items-center gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold">{g}</h3>
                <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
              </div>
              <ul className={full ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
                {list.map((row, i) => (
                  <Reveal key={row[0]} i={i}>
                    <Entry row={row} needle={needle} full={full} />
                  </Reveal>
                ))}
              </ul>
            </section>
          );
        })}

        {!rows.length && (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-text-muted">
              <SearchIcon />
            </span>
            <p className="text-sm text-text-muted">{t('glossary.none')}</p>
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="rounded-full px-4 py-1.5 text-[13px] text-gold ring-1 ring-gold/40 transition hover:bg-gold/10"
              >
                {L.clear}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Full-screen overlay ---------- */
function FullScreen({
  titleId, title, subtitle, onExit, onClose, children,
}: {
  titleId: string;
  title: string;
  subtitle: string;
  onExit: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const L = useLabels();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const btn =
    'flex h-10 w-10 items-center justify-center rounded-full text-text-muted ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:text-gold hover:ring-gold/50 active:scale-95';

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`fixed inset-0 z-[70] flex flex-col bg-black/95 outline-none backdrop-blur-2xl transition-all duration-300 motion-reduce:transition-none ${
        shown ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(212,175,55,0.14),transparent)]"
      />
      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/30">
            <BookIcon />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
            <p className="truncate text-[13px] text-text-muted">{subtitle}</p>
          </div>
          <button type="button" onClick={onExit} aria-label={L.collapse} title={L.collapse} className={btn}>
            <CollapseIcon />
          </button>
          <button type="button" onClick={onClose} aria-label={L.close} title={L.close} className={btn}>
            <XIcon />
          </button>
        </div>
      </header>
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col pt-5">{children}</div>
    </div>,
    document.body,
  );
}

/** Glossary side panel with an optional full-screen view. Stays mounted, so search and filter survive closing. */
export function GlossaryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const { t } = useT();
  const fullTitleId = useId();

  // Reopening always starts in the side panel.
  useEffect(() => {
    if (!open) setFull(false);
  }, [open]);

  const needle = q.trim().toLowerCase();

  const searched = useMemo<Row[]>(() => {
    return (Object.entries(GLOSSARY) as Row[])
      .filter(([k, e]) => !e.hidden && !k.startsWith('u_') && !['vaar', 'guntha', 'vigha'].includes(k))
      .filter(([, e]) => !needle || `${e.term} ${e.tip} ${e.extra ?? ''}`.toLowerCase().includes(needle))
      .sort(([, a], [, b]) => a.term.localeCompare(b.term));
  }, [needle]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [, e] of searched) c[e.group] = (c[e.group] ?? 0) + 1;
    return c;
  }, [searched]);

  const rows = useMemo(
    () => (group === null ? searched : searched.filter(([, e]) => e.group === group)),
    [searched, group],
  );

  const exitFull = useCallback(() => setFull(false), []);

  const shared = { q, setQ, needle, group, setGroup, counts, rows };

  return (
    <>
      <SidePanel
        open={open && !full}
        onClose={onClose}
        titleId="glossary-title"
        title={t('glossary.title')}
        subtitle={t('glossary.sub')}
      >
        <Content {...shared} full={false} onExpand={() => setFull(true)} />
      </SidePanel>

      {open && full && (
        <FullScreen
          titleId={fullTitleId}
          title={t('glossary.title')}
          subtitle={t('glossary.sub')}
          onExit={exitFull}
          onClose={onClose}
        >
          <Content {...shared} full />
        </FullScreen>
      )}
    </>
  );
}