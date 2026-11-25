'use client';

import { formatINR, formatINRWords, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useT } from '@/state/LanguageContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { ShareMenu } from '@/components/share/ShareMenu';
import { CompositionBar } from './CompositionBar';

function Stat({ label, value, tip }: { label: string; value: string; tip: string }) {
  return (
    <div>
      <p className="flex items-center text-[13px] text-text-muted">{label}<Tooltip term={tip} /></p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export function CostHero({ cost }: { cost: CostResult }) {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <p className="relative flex items-center text-sm text-text-muted">{t('cost.pay')}<Tooltip term="allIn" /></p>
      <p className="relative mt-1 text-[42px] font-semibold leading-none tracking-tight text-gold sm:text-6xl">
        <AnimatedNumber value={cost.allInCost} format={formatINR} testId="all-in" />
      </p>
      <div className="relative mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-text">{formatINRWords(cost.allInCost)}</span>
        {cost.overHeadlinePct != null && (
          <span className="flex items-center rounded-full bg-white/[0.06] px-2.5 py-1 text-[13px] text-text-muted">
            +{formatPct(cost.overHeadlinePct, 1)} {t('cost.over')}<Tooltip term="overHeadline" />
          </span>
        )}
      </div>

      <div className="relative mt-8"><CompositionBar cost={cost} /></div>

      <div className="relative mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
        <Stat label={t('cost.perUse')} tip="effCarpet" value={cost.effectiveRatePerCarpetSqft != null ? formatINR(cost.effectiveRatePerCarpetSqft) : '—'} />
        <Stat label={t('cost.perSbu')} tip="effSbu" value={cost.effectiveRatePerSbuSqft != null ? formatINR(cost.effectiveRatePerSbuSqft) : '—'} />
      </div>

      <div className="relative mt-6"><ShareMenu /></div>
    </section>
  );
}
