'use client';

import { useState } from 'react';
import { rowAmount } from '@/engine/costSheet';
import type { AddOnRow, AreaResult } from '@/engine/types';
import { makeId } from '@/state/defaults';
import { Button } from '@/components/ui/Button';
import { AddOnRowEditor } from './AddOnRowEditor';

export function AddOnRows({
  rows, area, basePrice, onChange,
}: {
  rows: AddOnRow[];
  area: AreaResult;
  basePrice: number;
  onChange: (rows: AddOnRow[]) => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const setOpen = (id: string, open: boolean) =>
    setOpenIds((s) => {
      const n = new Set(s);
      if (open) n.add(id); else n.delete(id);
      return n;
    });
  const update = (id: string, patch: Partial<AddOnRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addCustom = () => {
    const id = makeId();
    onChange([...rows, { id, name: 'Custom charge', basis: 'lumpSum', amount: 0, inAgreementValue: false, gst: 0, refundable: false }]);
    setOpen(id, true);
  };

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <AddOnRowEditor
          key={r.id}
          row={r}
          computed={r.amount > 0 ? rowAmount(r, area.carpetSqft, area.sbuSqft, basePrice) : null}
          open={openIds.has(r.id)}
          onToggle={(o) => setOpen(r.id, o)}
          onChange={(p) => update(r.id, p)}
          onDelete={() => onChange(rows.filter((x) => x.id !== r.id))}
        />
      ))}
      <Button variant="secondary" onClick={addCustom} className="w-full">+ Add custom charge</Button>
    </div>
  );
}
