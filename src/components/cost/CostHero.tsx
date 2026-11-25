'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { formatINR, formatINRWords, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useT } from '@/state/LanguageContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { ShareMenu } from '@/components/share/ShareMenu';
import { CompositionBar } from './CompositionBar';

/* ---------- Helpers ---------- */

/** Fade + rise in on mount. Uses the Web Animations API so no CSS transform is left behind
 *  afterwards (a leftover transform breaks tooltips). */
function Reveal({ i, children, className = '' }: { i: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 600, delay: i * 90, easing: 'ease-out', fill: 'backwards' },
    );
  }, [i]);
  return <div ref={ref} className={className}>{children}</div>;
}

function Svg({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {children}
    </svg>
  );
}
const WalletIcon = () => (
  <Svg>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </Svg>
);
const HomeIcon = () => <Svg><path d="m3 10.5 9-7.5 9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></Svg>;
const BuildingIcon = () => (
  <Svg>
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
  </Svg>
);
const ArrowUpIcon = () => <Svg size={14}><path d="M12 19V5M5 12l7-7 7 7" /></Svg>;

/** No hover lift here: a transform on a card with a tooltip inside breaks the tooltip. */
function Stat({ label, value, tip, icon }: { label: string; value: string; tip: string; icon: ReactNode }) {
  return (
    <div className="group/stat rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07] transition-colors duration-300 hover:bg-white/[0.06] hover:ring-gold/40">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/20 transition-colors duration-300 group-hover/stat:bg-gold group-hover/stat:text-black">
          {icon}
        </span>
        <p className="flex min-w-0 items-center text-[13px] leading-snug text-text-muted">
          {label}
          <Tooltip term={tip} />
        </p>
      </div>
      <p className="mt-2.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">{value}</p>
    </div>
  );
}

export function CostHero({ cost }: { cost: CostResult }) {
  const { t } = useT();
  return (
    <section className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-gold/[0.09] p-5 ring-1 ring-gold/25 transition-shadow duration-500 hover:shadow-2xl hover:shadow-gold/10 sm:p-8">
      {/* Glow + sheen */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-gold/[0.07] blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[250%] motion-reduce:hidden"
      />

      {/* Headline */}
      <Reveal i={0} className="relative">
        <p className="flex items-center gap-2.5 text-sm font-medium text-text-muted">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/20">
            <WalletIcon />
          </span>
          <span className="flex items-center">
            {t('cost.pay')}
            <Tooltip term="allIn" />
          </span>
        </p>
        <p className="mt-3 text-[32px] font-bold leading-none tracking-tight tabular-nums text-gold drop-shadow-[0_0_24px_rgba(212,175,55,0.25)] min-[360px]:text-[38px] min-[420px]:text-[46px] sm:text-6xl">
          <AnimatedNumber value={cost.allInCost} format={formatINR} testId="all-in" />
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-base font-medium text-text">{formatINRWords(cost.allInCost)}</span>
          {cost.overHeadlinePct != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-[13px] font-semibold text-gold ring-1 ring-gold/30">
              <ArrowUpIcon />
              {formatPct(cost.overHeadlinePct, 1)} {t('cost.over')}
              <Tooltip term="overHeadline" />
            </span>
          )}
        </div>
      </Reveal>

      {/* Where the money goes */}
      <Reveal i={1} className="relative mt-6 sm:mt-8">
        <div className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/[0.06] sm:p-5">
          <CompositionBar cost={cost} />
        </div>
      </Reveal>

      {/* Effective rates */}
      <Reveal i={2} className="relative mt-4">
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <Stat
            label={t('cost.perUse')}
            tip="effCarpet"
            icon={<HomeIcon />}
            value={cost.effectiveRatePerCarpetSqft != null ? formatINR(cost.effectiveRatePerCarpetSqft) : '—'}
          />
          <Stat
            label={t('cost.perSbu')}
            tip="effSbu"
            icon={<BuildingIcon />}
            value={cost.effectiveRatePerSbuSqft != null ? formatINR(cost.effectiveRatePerSbuSqft) : '—'}
          />
        </div>
      </Reveal>

      <Reveal i={3} className="relative mt-5 border-t border-white/5 pt-5">
        <ShareMenu />
      </Reveal>
    </section>
  );
}