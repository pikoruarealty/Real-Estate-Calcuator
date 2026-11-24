'use client';

import type { Warning } from '@/engine/types';
import { ADVISOR_WARNINGS, INFO_WARNINGS, warningText } from '@/content/copy';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';

export function WarningBanner({ w }: { w: Warning }) {
  const info = INFO_WARNINGS.includes(w.code);
  return (
    <div
      role={info ? 'note' : 'alert'}
      className={`flex gap-3 rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${info ? 'bg-surface text-text-muted' : 'bg-warn/[0.08] text-text'}`}
    >
      <span aria-hidden className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${info ? 'bg-gold-muted' : 'bg-warn'}`} />
      <div className="min-w-0 flex-1">
        <p>{warningText(w)}</p>
        {ADVISOR_WARNINGS.includes(w.code) && <div className="mt-2"><AdvisorButton variant="link" /></div>}
      </div>
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
