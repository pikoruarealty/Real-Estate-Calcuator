'use client';

import { useState } from 'react';
import { rowAmount } from '@/engine/costSheet';
import { formatINR } from '@/engine/format';
import type { AddOnRow, AreaResult } from '@/engine/types';
import { PRESET_ROWS, makeId } from '@/state/defaults';
import { AddOnRowEditor } from './AddOnRowEditor';

const SHORT: Record<string, string> = {
  plc: 'PLC', parking: 'Parking', club: 'Club', devPackage: 'Development', maintDeposit: 'Maintenance deposit', advanceMaint: 'Advance maintenance', legal: 'Legal',
};

/**
 * Charges with an amount (or just added) are shown as rows; the rest are quick-add chips.
 * Presets are never deleted, only reset to 0, so they can be re-added from a chip.
 */
export function AddOnRows({
  rows, area, basePrice, onChange,
}: {
  rows: AddOnRow[];
  area: AreaResult;
  basePrice: number;
  onChange: (rows: AddOnRow[]) => void;
}) {
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);

  const active = rows.filter((r) => r.amount > 0 || shown.has(r.id));
  const chips = rows.filter((r) => r.presetKey && !(r.amount > 0) && !shown.has(r.id));
  // A preset row that was deleted in an older version can be restored from PRESET_ROWS.
  const missing = PRESET_ROWS.filter((p) => !rows.some((r) => r.presetKey === p.presetKey));

  const show = (id: string) => {
    setShown((s) => new Set(s).add(id));
    setOpenId(id);
    setFresh(id);
  };
  const update = (id: string, patch: Partial<AddOnRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (r: AddOnRow) => {
    setShown((s) => { const n = new Set(s); n.delete(r.id); return n; });
    if (r.presetKey) update(r.id, { amount: 0 });
    else onChange(rows.filter((x) => x.id !== r.id));
  };
  const addCustom = () => {
    const id = makeId();
    onChange([...rows, { id, name: 'Other charge', basis: 'lumpSum', amount: 0, inAgreementValue: false, gst: 0, refundable: false }]);
    show(id);
  };

  const total = active.reduce((s, r) => {
    const a = r.amount > 0 ? rowAmount(r, area.carpetSqft, area.sbuSqft, basePrice) : 0;
    return s + Math.round(a ?? 0);
  }, 0);

  return (
    <div>
      {active.length > 0 && (
        <div className="mb-4 space-y-2">
          {active.map((r) => (
            <AddOnRowEditor
              key={r.id}
              row={r}
              open={openId === r.id}
              autoFocus={fresh === r.id}
              computed={r.amount > 0 ? rowAmount(r, area.carpetSqft, area.sbuSqft, basePrice) : null}
              onToggle={() => { setFresh(null); setOpenId((o) => (o === r.id ? null : r.id)); }}
              onChange={(p) => update(r.id, p)}
              onRemove={() => remove(r)}
            />
          ))}
          {total > 0 && (
            <p className="flex justify-between px-1 pt-1 text-sm text-text-muted">
              <span>Extra charges</span>
              <span className="text-text">{formatINR(total)}</span>
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {chips.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => show(r.id)}
            className="min-h-9 rounded-full border border-white/10 px-3.5 text-[13px] text-text-muted transition hover:border-gold/60 hover:text-gold"
          >
            + {SHORT[r.presetKey!] ?? r.name}
          </button>
        ))}
        {missing.map((p) => (
          <button
            key={p.presetKey}
            type="button"
            onClick={() => {
              const row = { ...p, id: p.presetKey, amount: 0 };
              onChange([...rows, row]);
              show(row.id);
            }}
            className="min-h-9 rounded-full border border-white/10 px-3.5 text-[13px] text-text-muted transition hover:border-gold/60 hover:text-gold"
          >
            + {SHORT[p.presetKey]}
          </button>
        ))}
        <button
          type="button"
          onClick={addCustom}
          className="min-h-9 rounded-full border border-dashed border-white/15 px-3.5 text-[13px] text-text-muted transition hover:border-gold/60 hover:text-gold"
        >
          + Something else
        </button>
      </div>
    </div>
  );
}
