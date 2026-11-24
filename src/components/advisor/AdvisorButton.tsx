'use client';

import { useApp } from '@/state/CalculatorContext';
import { Button } from '@/components/ui/Button';
import { track } from '@/lib/analytics';

export function AdvisorButton({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const { setAdvisorOpen } = useApp();
  return (
    <Button
      variant={compact ? 'secondary' : 'primary'}
      className={className}
      onClick={() => {
        track('advisor_open');
        setAdvisorOpen(true);
      }}
    >
      {compact ? 'Talk to our advisor' : 'Confused? Talk to our expert advisor'}
    </Button>
  );
}
