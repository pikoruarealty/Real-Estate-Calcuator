import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { BRAND } from '@/config/brand';
import { DISCLAIMER, LOAN_NOTE } from '@/content/copy';
import { SQFT_PER_SQM, SQFT_PER_UNIT } from '@/engine/config';
import { formatAreaNumber, formatINR, formatINRWords, formatPct } from '@/engine/format';
import type { CalculatorInput, CalculatorResult } from '@/engine/types';
import { buildSheet, type SheetSection } from '@/lib/sheet';

const GOLD = '#B8962E'; // slightly deeper gold for white paper
const GOLD_BRIGHT = '#D4AF37';

let fontsRegistered = false;
function registerFonts(origin: string) {
  if (fontsRegistered) return;
  fontsRegistered = true;
  Font.register({
    family: 'Geist',
    fonts: [
      { src: `${origin}/fonts/Geist-Regular.ttf`, fontWeight: 400 },
      { src: `${origin}/fonts/Geist-SemiBold.ttf`, fontWeight: 600 },
      { src: `${origin}/fonts/Geist-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]); // never hyphenate
}

const s = StyleSheet.create({
  page: { fontFamily: 'Geist', fontSize: 8.5, color: '#1a1a1a', paddingBottom: 48 },
  band: { backgroundColor: '#0B0B0B', paddingHorizontal: 36, paddingVertical: 20 },
  brand: { color: GOLD_BRIGHT, fontSize: 18, fontWeight: 700 },
  tag: { color: '#9A968C', fontSize: 8, marginTop: 3 },
  body: { paddingHorizontal: 36, paddingTop: 16 },
  title: { fontSize: 15, fontWeight: 700 },
  meta: { color: '#666', marginTop: 3 },
  h: { fontSize: 10, fontWeight: 700, color: GOLD, marginTop: 14, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: GOLD },
  row: { flexDirection: 'row', paddingVertical: 3.5, borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  cItem: { width: '31%', paddingRight: 4 },
  cCalc: { width: '29%', color: '#666', paddingRight: 4 },
  cNum: { width: '13.3%', textAlign: 'right' },
  th: { fontWeight: 700, color: '#555' },
  sub: { flexDirection: 'row', paddingVertical: 4, backgroundColor: '#f6f1e0', fontWeight: 700 },
  total: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0B0B0B', paddingHorizontal: 10, paddingVertical: 9, marginTop: 10 },
  totalL: { color: GOLD_BRIGHT, fontSize: 12, fontWeight: 700 },
  totalR: { color: GOLD_BRIGHT, fontSize: 14, fontWeight: 700 },
  small: { fontSize: 7.5, color: '#666', lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 18, left: 36, right: 36, borderTopWidth: 0.5, borderTopColor: GOLD, paddingTop: 5 },
});

function SheetBlock({ title, section, showGst, subLabel }: { title: string; section: SheetSection; showGst: boolean; subLabel: string }) {
  return (
    <View wrap={false}>
      <Text style={s.h}>{title}</Text>
      {section.rows.map((l) => (
        <View key={l.key} style={s.row}>
          <Text style={s.cItem}>{l.label}{l.refundable ? ' (refundable)' : ''}</Text>
          <Text style={s.cCalc}>{l.calc}</Text>
          <Text style={s.cNum}>{formatINR(l.amount)}</Text>
          <Text style={s.cNum}>{showGst && l.gstAmount != null ? `${formatINR(l.gstAmount)} @${formatPct(l.gstPct ?? 0)}` : '—'}</Text>
          <Text style={s.cNum}>{formatINR(l.amount + (showGst ? l.gstAmount ?? 0 : 0))}</Text>
        </View>
      ))}
      <View style={s.sub}>
        <Text style={[s.cItem, { width: '60%' }]}>{subLabel}</Text>
        <Text style={s.cNum}>{formatINR(section.amount)}</Text>
        <Text style={s.cNum}>{section.gst ? formatINR(section.gst) : '—'}</Text>
        <Text style={s.cNum}>{formatINR(section.total)}</Text>
      </View>
    </View>
  );
}

export function CostSheetPdf({
  input, result, shareUrl, origin, date,
}: {
  input: CalculatorInput;
  result: CalculatorResult;
  shareUrl: string;
  origin: string;
  date: string;
}) {
  registerFonts(origin);
  const { area, cost, loan } = result;
  const sheet = cost ? buildSheet(cost) : null;
  const sqft = (n: number | null) => (n == null ? '—' : formatAreaNumber(n));
  return (
    <Document title={`Cost sheet ${input.cost.projectName || 'property'}`} author={BRAND.name}>
      <Page size="A4" style={s.page}>
        <View style={s.band} fixed>
          <Text style={s.brand}>{BRAND.name}</Text>
          <Text style={s.tag}>{BRAND.tagline}</Text>
        </View>
        <View style={s.body}>
          <Text style={s.title}>{input.cost.projectName || 'Property cost sheet'}</Text>
          <Text style={s.meta}>Prepared on {date}</Text>

          <Text style={s.h}>Areas</Text>
          <View style={s.row}>
            <Text style={[s.cItem, s.th]}>Area</Text>
            <Text style={[s.cNum, s.th, { width: '20%' }]}>Sq ft</Text>
            <Text style={[s.cNum, s.th, { width: '20%' }]}>Sq m</Text>
            <Text style={[s.cNum, s.th, { width: '20%' }]}>Sq yd</Text>
          </View>
          {([
            ['Carpet', area.carpetSqft], ['RERA area', area.reraAreaSqft], ['Super built-up', area.sbuSqft], ['Common area', area.commonAreaSqft],
          ] as [string, number | null][]).map(([l, v]) => (
            <View key={l} style={s.row}>
              <Text style={s.cItem}>{l}</Text>
              <Text style={[s.cNum, { width: '20%' }]}>{sqft(v)}</Text>
              <Text style={[s.cNum, { width: '20%' }]}>{v == null ? '—' : formatAreaNumber(v / SQFT_PER_SQM)}</Text>
              <Text style={[s.cNum, { width: '20%' }]}>{v == null ? '—' : formatAreaNumber(v / SQFT_PER_UNIT.sqyd)}</Text>
            </View>
          ))}
          {area.loadingPct != null && (
            <Text style={[s.small, { marginTop: 4 }]}>
              Loading {formatPct(area.loadingPct)} · Kapat {formatPct(area.kapatPct ?? 0)} · Efficiency {formatPct(area.efficiencyPct ?? 0)}
            </Text>
          )}

          {sheet && cost ? (
            <>
              <View style={[s.row, { marginTop: 14, borderBottomWidth: 1, borderBottomColor: '#999' }]}>
                <Text style={[s.cItem, s.th]}>Item</Text>
                <Text style={[s.cCalc, s.th]}>Calculation</Text>
                <Text style={[s.cNum, s.th]}>Amount</Text>
                <Text style={[s.cNum, s.th]}>GST</Text>
                <Text style={[s.cNum, s.th]}>Total</Text>
              </View>
              <SheetBlock title="A · Agreement value" section={sheet.a} showGst={false} subLabel="Agreement value + GST" />
              {sheet.b.rows.length > 0 && <SheetBlock title="B · Other builder charges" section={sheet.b} showGst subLabel="Other charges subtotal" />}
              <SheetBlock title="C · Government charges" section={sheet.c} showGst={false} subLabel="Stamp duty + registration" />
              <View style={s.total} wrap={false}>
                <Text style={s.totalL}>All-in cost</Text>
                <Text style={s.totalR}>{formatINR(cost.allInCost)}  ({formatINRWords(cost.allInCost)})</Text>
              </View>
              <Text style={[s.small, { marginTop: 6 }]}>
                Effective rate: {cost.effectiveRatePerCarpetSqft != null ? `${formatINR(cost.effectiveRatePerCarpetSqft)} per carpet sq ft` : '—'}
                {' · '}{cost.effectiveRatePerSbuSqft != null ? `${formatINR(cost.effectiveRatePerSbuSqft)} per SBU sq ft` : '—'}
                {' · '}{cost.overHeadlinePct != null ? `${formatPct(cost.overHeadlinePct, 1)} over base price` : ''}
              </Text>
              <Text style={[s.small, { marginTop: 3 }]}>
                {cost.tds.applies
                  ? `TDS (information only, not an extra cost): deduct ${formatINR(cost.tds.amount)} (1% of ${formatINR(cost.tds.base)}) from payment to the builder and file Form 26QB.`
                  : 'TDS: not applicable below ₹50 lakh.'}
              </Text>
            </>
          ) : (
            <Text style={[s.small, { marginTop: 12 }]}>Cost sheet not available: enter the base rate and area.</Text>
          )}

          {loan && (
            <View wrap={false}>
              <Text style={s.h}>Loan summary</Text>
              {([
                ['Loan amount', `${formatINR(loan.loanAmount)} (${formatPct(loan.ltvUsedPct, 1)} of value)`],
                ['EMI', `${formatINR(loan.emi)} / month · ${input.loan.tenureYears} yrs @ ${input.loan.ratePct}%`],
                ['Total interest', formatINR(loan.totalInterest)],
                ['Total repayment', formatINR(loan.totalRepayment)],
                ['Upfront cash needed', `${formatINR(loan.upfrontCash)}${loan.upfrontExcludesTaxes ? ' (excluding taxes)' : ''}`],
              ] as [string, string][]).map(([k, v]) => (
                <View key={k} style={s.row}>
                  <Text style={{ width: '35%' }}>{k}</Text>
                  <Text>{v}</Text>
                </View>
              ))}
              <Text style={[s.small, { marginTop: 3 }]}>{LOAN_NOTE}</Text>
            </View>
          )}

          <View wrap={false} style={{ marginTop: 14 }}>
            <Text style={s.small}>{DISCLAIMER}</Text>
            {shareUrl ? (
              <View style={{ marginTop: 5 }}>
                <Text style={s.small}>Live calculation:</Text>
                {(shareUrl.match(/.{1,95}/g) ?? []).map((chunk, i) => <Text key={i} style={s.small}>{chunk}</Text>)}
              </View>
            ) : null}
          </View>
        </View>
        <Text
          fixed
          style={[s.small, { position: 'absolute', bottom: 24, right: 36 }]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
