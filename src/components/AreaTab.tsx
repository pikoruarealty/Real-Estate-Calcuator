'use client';

import { useApp } from '@/state/CalculatorContext';
import { AreaInputs } from '@/components/area/AreaInputs';
import { AreaResultCard } from '@/components/area/AreaResultCard';
import { UnitConverter } from '@/components/area/UnitConverter';
import { WarningList } from '@/components/ui/WarningBanner';

export function AreaTab() {
  const { input, result, setArea } = useApp();
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <AreaInputs area={input.area} result={result.area} onChange={setArea} />
        <UnitConverter />
      </div>
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <AreaResultCard area={result.area} vigha={input.area.vighaVariant} />
        <WarningList warnings={result.warnings} codes={['HIGH_LOADING', 'VIGHA_VARIES']} />
      </div>
    </div>
  );
}
