'use client';

import { useApp } from '@/state/CalculatorContext';
import { AreaInputs } from '@/components/area/AreaInputs';
import { AreaResultCard } from '@/components/area/AreaResultCard';
import { UnitConverter } from '@/components/area/UnitConverter';
import { WarningList } from '@/components/ui/WarningBanner';
import { useT } from '@/state/LanguageContext';
import { NextStep } from '@/components/layout/Tabs';

export function AreaTab({ onNext }: { onNext: () => void }) {
  const { input, result, setArea } = useApp();
  const { t } = useT();
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="min-w-0">
          <AreaInputs area={input.area} result={result.area} onChange={setArea} />
          <UnitConverter />
        </div>
        <div className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          <AreaResultCard area={result.area} vigha={input.area.vighaVariant} />
          <WarningList warnings={result.warnings} codes={['HIGH_LOADING', 'VIGHA_VARIES']} />
        </div>
      </div>
      <NextStep label={t('next.cost')} onClick={onNext} />
    </div>
  );
}
