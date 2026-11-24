/* eslint-disable @next/next/no-img-element */
import { forwardRef } from 'react';
import { BRAND } from '@/config/brand';
import { DISCLAIMER } from '@/content/copy';
import { formatAreaNumber, formatINR, formatINRWords } from '@/engine/format';
import type { CalculatorInput, CalculatorResult } from '@/engine/types';

/** 1080×1350 summary card, rendered off-screen and captured with html-to-image. */
export const ShareImageCard = forwardRef<HTMLDivElement, { input: CalculatorInput; result: CalculatorResult }>(
  function ShareImageCard({ input, result }, ref) {
    const { area, cost, loan } = result;
    const stat = (label: string, value: string) => (
      <div style={{ flex: 1, border: '2px solid #2A2A2A', borderRadius: 20, padding: '28px 30px', background: '#151515' }}>
        <div style={{ fontSize: 24, color: '#9A968C', textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
        <div style={{ fontSize: 44, marginTop: 10, color: '#F5F2EA', fontWeight: 600 }}>{value}</div>
      </div>
    );
    return (
      <div
        ref={ref}
        style={{
          width: 1080, height: 1350, background: '#0B0B0B', color: '#F5F2EA', padding: 72, boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist), system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={BRAND.logoPath} alt="" width={64} height={64} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 48, color: '#D4AF37', lineHeight: 1, letterSpacing: -1 }}>{BRAND.name}</div>
            <div style={{ fontSize: 24, color: '#9A968C', marginTop: 6 }}>{BRAND.tagline}</div>
          </div>
        </div>

        <div style={{ height: 2, background: '#D4AF37', margin: '44px 0' }} />

        <div style={{ fontSize: 34, color: '#9A968C' }}>{input.cost.projectName || 'Property cost estimate'}</div>
        <div style={{ fontSize: 28, color: '#9A968C', marginTop: 10 }}>
          {area.carpetSqft != null ? `Carpet ${formatAreaNumber(area.carpetSqft)} sq ft` : ''}
          {area.carpetSqft != null && area.sbuSqft != null ? '  ·  ' : ''}
          {area.sbuSqft != null ? `SBU ${formatAreaNumber(area.sbuSqft)} sq ft` : ''}
        </div>

        <div style={{ marginTop: 56 }}>
          <div style={{ fontSize: 28, color: '#9A968C', textTransform: 'uppercase', letterSpacing: 3 }}>All-in cost</div>
          <div style={{ fontWeight: 700, fontSize: 132, color: '#D4AF37', lineHeight: 1.05, marginTop: 8, letterSpacing: -4, fontVariantNumeric: 'lining-nums tabular-nums' }}>
            {cost ? formatINR(cost.allInCost) : '—'}
          </div>
          <div style={{ fontSize: 40, color: '#F5F2EA' }}>{cost ? formatINRWords(cost.allInCost) : ''}</div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 56 }}>
          {stat('Per carpet sq ft', cost?.effectiveRatePerCarpetSqft != null ? formatINR(cost.effectiveRatePerCarpetSqft) : '—')}
          {stat('EMI / month', loan && loan.loanAmount > 0 ? formatINR(loan.emi) : '—')}
        </div>

        <div style={{ marginTop: 'auto', fontSize: 17, lineHeight: 1.45, color: '#9A968C' }}>{DISCLAIMER}</div>
      </div>
    );
  },
);
