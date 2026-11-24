'use client';

import type { Warning } from '@/engine/types';
import { ADVISOR_WARNINGS, INFO_WARNINGS, warningText } from '@/content/copy';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';

export function WarningBanner({ w }: { w: Warning }) {
  const info = INFO_WARNINGS.includes(w.code);
  return (
    <div
      role={info ? 'note' : 'alert'}
      className={`flex flex-col gap-2 rounded-lg border px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between ${
        info ? 'border-border bg-surface-2 text-text' : 'border-warn/50 bg-warn/10 text-text'
      }`}
    >
      <p>
        <span aria-hidden className={`mr-2 ${info ? 'text-gold-muted' : 'text-warn'}`}>{info ? 'ⓘ' : '⚠'}</span>
        {warningText(w)}
      </p>
      {ADVISOR_WARNINGS.includes(w.code) && <AdvisorButton compact />}
    </div>
  );
}

export function WarningList({ warnings, codes }: { warnings: Warning[]; codes?: Warning['code'][] }) {
  const list = codes ? warnings.filter((w) => codes.includes(w.code)) : warnings;
  if (!list.length) return null;
  return (
    <div className="space-y-2">
      {list.map((w) => <WarningBanner key={w.code} w={w} />)}
    </div>
  );
}
