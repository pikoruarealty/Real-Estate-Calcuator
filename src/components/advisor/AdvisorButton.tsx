'use client';

import { useApp } from '@/state/CalculatorContext';
import { Button } from '@/components/ui/Button';
import { useT } from '@/state/LanguageContext';
import { track } from '@/lib/analytics';

/** variant: 'primary' (full CTA), 'compact' (sticky bar), 'link' (inline text link). */
export function AdvisorButton({
  variant = 'primary', compact, className = '',
}: { variant?: 'primary' | 'compact' | 'link'; compact?: boolean; className?: string }) {
  const { setAdvisorOpen } = useApp();
  const { t } = useT();
  const v = compact ? 'compact' : variant;
  const open = () => {
    track('advisor_open');
    setAdvisorOpen(true);
  };
  if (v === 'link') {
    return (
      <button type="button" onClick={open} className={`inline-flex min-h-8 items-center gap-1 text-sm font-medium text-gold hover:underline ${className}`}>
        {t('advisor.link')} <span aria-hidden>→</span>
      </button>
    );
  }
  return (
    <Button variant={v === 'compact' ? 'secondary' : 'primary'} className={className} onClick={open}>
      {v === 'compact' ? 'Ask an expert' : 'Confused? Talk to our expert advisor'}
    </Button>
  );
}
