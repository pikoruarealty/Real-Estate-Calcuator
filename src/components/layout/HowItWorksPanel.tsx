'use client';

import { useT } from '@/state/LanguageContext';
import { SidePanel } from './SidePanel';

export function HowItWorksPanel({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart: () => void }) {
  const { t } = useT();
  const steps = [1, 2, 3] as const;
  return (
    <SidePanel open={open} onClose={onClose} titleId="how-title" title={t('how.title')} subtitle={t('how.sub')}>
      <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
        <ol className="space-y-5 pt-2">
          {steps.map((n) => (
            <li key={n} className="flex gap-4">
              <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm font-semibold text-gold">{n}</span>
              <div>
                <h3 className="text-[15px] font-semibold">{t(`how.${n}.t`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{t(`how.${n}.d`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 border-t border-white/5 pt-4 text-[13px] leading-relaxed text-text-muted">{t('how.note')}</p>
        <button type="button" onClick={onStart} className="mt-5 min-h-11 rounded-full bg-gold px-6 text-sm font-semibold text-black transition hover:brightness-110">
          {t('how.start')}
        </button>
      </div>
    </SidePanel>
  );
}
