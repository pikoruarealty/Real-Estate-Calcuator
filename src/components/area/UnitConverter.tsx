'use client';

import { useMemo, useState } from 'react';
import { UNIT_LABELS, VIGHA_VARIANTS } from '@/engine/config';
import { ALL_UNITS, convert, convertToAll, lengthToArea, type LengthUnit } from '@/engine/units';
import { formatAreaNumber } from '@/engine/format';
import { warningText } from '@/content/copy';
import type { AreaUnit, VighaVariant } from '@/engine/types';
import { Disclosure } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { UnitSelect } from './AreaInputs';

export function UnitConverter() {
  const [value, setValue] = useState<number | null>(null);
  const [from, setFrom] = useState<AreaUnit>('sqft');
  const [vigha, setVigha] = useState<VighaVariant>('v17424');
  const [len, setLen] = useState<number | null>(null);
  const [wid, setWid] = useState<number | null>(null);
  const [lenUnit, setLenUnit] = useState<LengthUnit>('ft');

  const all = useMemo(() => (value != null && value > 0 ? convertToAll(value, from, vigha) : null), [value, from, vigha]);
  const lenSqft = len != null && wid != null && len > 0 && wid > 0 ? lengthToArea(len, wid, lenUnit) : null;

  return (
    <Disclosure summary="Unit converter" tip="converter" className="mt-4" hint="sq m, vaar, guntha, vigha ↔ sq ft">
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_9.5rem] items-end gap-2">
          <NumberInput label="Value to convert" value={value} onChange={setValue} min={0} placeholder="e.g. 1" />
          <UnitSelect value={from} onChange={setFrom} label="Convert from" />
        </div>

        <Select label="Vigha size used for conversion" tip="u_vigha" value={vigha} onChange={(v) => setVigha(v as VighaVariant)}>
            {(Object.keys(VIGHA_VARIANTS) as VighaVariant[]).map((k) => (
              <option key={k} value={k}>{VIGHA_VARIANTS[k].sqft.toLocaleString('en-IN')} sq ft — {VIGHA_VARIANTS[k].label}</option>
            ))}
          </Select>
        {(from === 'vigha' || vigha !== 'v17424') && (
          <p role="note" className="rounded-2xl bg-warn/[0.08] px-4 py-3 text-sm">{warningText({ code: 'VIGHA_VARIES' })}</p>
        )}

        {all && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3" aria-label="Converted values">
            {ALL_UNITS.filter((u) => u !== from).map((u) => (
              <div key={u} className="flex justify-between gap-2 border-b border-white/5 py-2">
                <dt className="flex items-center text-text-muted">{UNIT_LABELS[u]}<Tooltip term={`u_${u}`} /></dt>
                <dd className="text-right">{formatAreaNumber(all[u])}</dd>
              </div>
            ))}
          </dl>
        )}

        <fieldset className="rounded-2xl bg-bg/60 p-4">
          <legend className="float-left mb-3 flex w-full items-center text-[13px] text-text-muted">Length × width → area<Tooltip term="lengthHelper" /></legend>
          <div className="clear-both grid grid-cols-[1fr_1fr_5.5rem] items-end gap-2">
            <NumberInput label="Length" value={len} onChange={setLen} min={0} />
            <NumberInput label="Width" value={wid} onChange={setWid} min={0} />
            <Select label="Unit" value={lenUnit} onChange={(v) => setLenUnit(v as LengthUnit)}>
              <option value="ft">ft</option>
              <option value="m">m</option>
              <option value="yd">yd</option>
            </Select>
          </div>
          {lenSqft != null && (
            <p className="mt-3 text-sm">
              = <strong className="text-gold">{formatAreaNumber(lenSqft)}</strong> sq ft ·{' '}
              {formatAreaNumber(convert(lenSqft, 'sqft', 'sqm', vigha))} sq m · {formatAreaNumber(convert(lenSqft, 'sqft', 'sqyd', vigha))} sq yd
            </p>
          )}
        </fieldset>
      </div>
    </Disclosure>
  );
}
