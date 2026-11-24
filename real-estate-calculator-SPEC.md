# Ahmedabad Real Estate Calculator — Build Spec for Coding Agents

Version: 1.0 · Date: 2026-11-24 · Owner: Deep (PIKORUA Proptech)

---

## 0. Instructions for the coding agent (read first)

You are building a standalone, public, mobile-first web app. This file is the single source of truth. Follow it literally; where it is silent, choose the simplest option and leave a `// TODO(spec):` comment.

**Hard rules**

1. **Engine first.** Build `src/engine/**` (pure TypeScript, no React, no DOM, no I/O) and its tests before any UI.
2. **No magic numbers.** Every statutory number (GST %, stamp duty %, thresholds, LTV slabs, unit factors) lives ONLY in `src/engine/config.ts`. UI and other engine files import from it.
3. **Tests are the acceptance gate.** Every fixture in §12 must pass in `npm test`. Do not change expected values to make tests pass; fix the code. If you believe a fixture is wrong, stop and report it.
4. **Money precision.** Compute in JS numbers at full precision; round each *displayed line item* to the nearest rupee (`Math.round`) and compute subtotals/totals as the sum of rounded lines (§6.6).
5. **Live calculation.** No "Calculate" button. Recompute on every input change.
6. **Indian formatting everywhere** (`₹1,23,62,782`, plus words `₹1.24 Cr` / `₹46.18 L`).
7. **Placeholders** (brand name, WhatsApp number, lead webhook) come from `src/config/brand.ts` and env vars (§14). Never hard-code them elsewhere.
8. Work milestone by milestone (§13). After each milestone: `npm run lint && npm run typecheck && npm test` must be green.

**Definition of done:** all §13 checkboxes ticked, all §12 tests green, Lighthouse mobile ≥ 90 for Performance and Accessibility, app deployable to Vercel with `npm run build`.

---

## 1. Product summary

A free web calculator that turns any Ahmedabad property quote into:

1. **True areas:** carpet, RERA area, super built-up (SBU), loading %, kapat %, in any Indian unit.
2. **True all-in cost:** base price + floor rise + PLC + any builder add-ons + GST + stamp duty + registration, plus TDS info.
3. **Loan view:** max eligible loan (RBI LTV), EMI, total interest, upfront cash needed.
4. **Shareable cost sheet:** PDF, PNG, WhatsApp, link.

Audience: general public (buyers, investors, NRIs, brokers). No login. A CTA "Confused? Talk to our expert advisor" collects leads but never gates any feature.

Out of scope for v1 (do NOT build): multi-project comparison, payment-plan schedule, AMC property tax, ROI/rental yield, plot/bungalow pricing mode, Gujarati/Hindi UI, accounts, live Jantri lookup.

---

## 2. Tech stack and commands

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4 with theme tokens from §8 |
| Fonts | `next/font/google`: Cormorant Garamond (display), Inter (UI, tabular numbers) |
| State | React state in one `useCalculator()` hook; URL sync via `lz-string` |
| Tests | Vitest (engine), Playwright (2 smoke e2e tests) |
| PDF | `@react-pdf/renderer` (client-side) |
| PNG | `html-to-image` |
| Lead API | Next.js Route Handler `POST /api/lead` |
| Validation | `zod` |
| Analytics | Plausible script, enabled only if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set |
| Deploy | Vercel |

Scripts in `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:e2e`.

---

## 3. Repository structure

```
src/
  app/
    layout.tsx              # fonts, theme, analytics, metadata
    page.tsx                # the calculator (tabs)
    terms/page.tsx          # T&C + privacy
    api/lead/route.ts       # advisor lead endpoint
  config/
    brand.ts                # placeholders (§14)
  engine/
    config.ts               # ALL statutory constants + unit factors (§5)
    types.ts                # all engine types (§4)
    units.ts                # unit conversion
    areas.ts                # area resolution
    costSheet.ts            # cost sheet + taxes
    loan.ts                 # LTV, EMI, amortisation
    warnings.ts             # warning generation
    format.ts               # INR formatting, words
    index.ts                # public API: calculate(input) -> result
    __tests__/
      fixtures.ts           # §12 fixtures
      engine.test.ts
  state/
    useCalculator.ts        # holds CalculatorInput, derives result via engine
    urlState.ts             # encode/decode input <-> URL
    defaults.ts             # default input (§7.0)
  components/
    layout/ Header, Tabs, StickyTotalBar, Footer, Disclaimer
    area/   AreaInputs, AreaResultCard, UnitConverter
    cost/   CostInputs, AddOnRows, AddOnRowEditor, CostSheetTable, EffectiveRateTiles, CompositionBar
    loan/   LoanInputs, LoanTiles, AmortisationTable
    share/  ShareMenu, CostSheetPdf, ShareImageCard
    advisor/ AdvisorButton, AdvisorDialog
    ui/     NumberInput, Select, Toggle, Tooltip, Card, Button, WarningBanner
  content/
    glossary.ts             # tooltip texts (§15)
    copy.ts                 # all user-facing strings: disclaimer, warnings (§11)
e2e/
  smoke.spec.ts
```

---

## 4. Engine types (`src/engine/types.ts`)

Implement exactly (names may not change; extra optional fields allowed).

```ts
export type AreaUnit =
  | 'sqft' | 'sqm' | 'sqyd' | 'guntha' | 'are' | 'acre' | 'hectare'
  | 'vigha' | 'cent' | 'ground' | 'marla' | 'kanal';

export type VighaVariant = 'v17424' | 'v21780' | 'v16875' | 'v23958';

export type KnownAreaType = 'carpet' | 'sbu' | 'reraArea' | 'carpetAndSbu';
export type CommonAreaMode = 'loading' | 'kapat';

export interface AreaInput {
  knownType: KnownAreaType;
  value: number | null;          // the known area (carpet, sbu or reraArea)
  unit: AreaUnit;                // unit of `value` (and of `sbuValue`)
  sbuValue: number | null;       // only used when knownType === 'carpetAndSbu' (value = carpet)
  mode: CommonAreaMode;
  pct: number | null;            // loading % or kapat %, per `mode`; ignored for 'carpetAndSbu'
  balconySqft: number;           // default 0
  washSqft: number;              // default 0
  terraceSqft: number;           // default 0
  vighaVariant: VighaVariant;    // default 'v17424'
}

export interface AreaResult {
  carpetSqft: number | null;
  sbuSqft: number | null;
  reraAreaSqft: number | null;   // carpet + balcony + wash + terrace
  commonAreaSqft: number | null; // sbu - carpet
  loadingPct: number | null;     // (sbu - carpet) / carpet * 100
  kapatPct: number | null;       // (sbu - carpet) / sbu * 100
  efficiencyPct: number | null;  // carpet / sbu * 100
}

export type PropertyType = 'flat' | 'penthouse' | 'commercialOffice' | 'shop';
export type RateBasis = 'sbu' | 'carpet';
export type ConstructionStatus = 'underConstruction' | 'ready';
export type BuyerType = 'male' | 'soleWoman' | 'joint' | 'company';
export type CommercialGst = 5 | 12;

export type AddOnBasis =
  | 'perSqftSbu'       // amount x SBU
  | 'perSqftCarpet'    // amount x carpet
  | 'lumpSum'          // amount
  | 'pctOfBase'        // amount% x base price
  | 'perSqftMonth';    // amount x area(monthlyAreaBasis) x months

export type GstChoice = 'auto' | 0 | 5 | 18;

export interface AddOnRow {
  id: string;                    // stable uuid
  presetKey?: PresetKey;         // set for preset rows
  name: string;
  basis: AddOnBasis;
  amount: number;                // 0 = row contributes nothing
  months?: number;               // required when basis === 'perSqftMonth'
  monthlyAreaBasis?: RateBasis;  // default 'sbu'
  inAgreementValue: boolean;
  gst: GstChoice;                // 'auto' = property GST slab
  refundable: boolean;           // display label only
}

export type PresetKey =
  | 'plc' | 'parking' | 'club' | 'devPackage'
  | 'maintDeposit' | 'advanceMaint' | 'legal';

export interface CostInput {
  propertyType: PropertyType;
  baseRate: number | null;       // Rs per sqft
  rateBasis: RateBasis;
  floor: number;                 // default 0
  frcBaseFloor: number;          // default 0
  frcRatePerFloor: number;       // Rs per sqft per floor, default 0
  status: ConstructionStatus;
  buyerType: BuyerType;
  commercialGst: CommercialGst;  // default 12, used only for commercialOffice/shop
  agreementValueOverride: number | null;
  jantriValue: number | null;    // direct Rs value; takes priority over rate
  jantriRatePerSqm: number | null;
  jantriAreaSqm: number | null;  // default = carpet in sqm
  addOns: AddOnRow[];
  projectName: string;           // optional, printed on PDF
  overrides: StatutoryOverrides; // Advanced panel, all optional
}

export interface StatutoryOverrides {
  stampDutyPct?: number;
  registrationPct?: number;
  registrationCap?: number | null;
  gstUnderConstructionPct?: number;
}

export interface LoanInput {
  valueOverride: number | null;  // default null -> use agreement value
  mode: 'maxEligible' | 'percent' | 'amount';
  percent: number | null;
  amount: number | null;
  ratePct: number;               // default 8.0
  tenureYears: number;           // default 20
  processingFeePct: number;      // default 0.5
  monthlyIncome: number | null;
}

export interface CalculatorInput {
  v: 1;                          // schema version for URL state
  area: AreaInput;
  cost: CostInput;
  loan: LoanInput;
}

export interface CostLine {
  key: string;                   // 'base' | 'frc' | 'avAdjustment' | row.id | 'gstAv' | 'stampDuty' | 'registration'
  label: string;
  calc: string;                  // human-readable calculation, e.g. "1,620 sq ft × ₹6,500"
  amount: number;                // rounded rupees
  gstPct?: number;
  gstAmount?: number;            // rounded
  block: 'A' | 'B' | 'C';        // A = agreement value, B = other builder charges, C = government
  refundable?: boolean;
}

export interface CostResult {
  lines: CostLine[];
  basePrice: number;
  frc: number;
  computedAgreementValue: number;
  agreementValue: number;        // override if given, else computed
  propertyGstPct: number;        // 0 | 1 | 5 | 12
  isAffordable: boolean;
  gstOnAgreementValue: number;
  otherChargesTotal: number;     // block B amounts excl. GST
  otherChargesGst: number;
  payableToBuilder: number;
  jantriValue: number | null;
  stampValue: number;
  stampDuty: number;
  registration: number;
  governmentTotal: number;
  allInCost: number;
  tds: { applies: boolean; base: number; amount: number };
  effectiveRatePerCarpetSqft: number | null;
  effectiveRatePerSbuSqft: number | null;
  overHeadlinePct: number | null; // allIn / basePrice - 1, as %
}

export interface LoanResult {
  propertyValue: number;
  maxEligible: number;
  loanAmount: number;
  ltvUsedPct: number;
  capped: boolean;
  emi: number;                   // rounded
  totalInterest: number;         // rounded, from unrounded EMI
  totalRepayment: number;
  processingFee: number;
  upfrontCash: number;           // allInCost - loan + processingFee
  emiToIncomePct: number | null;
  yearly: { year: number; opening: number; principal: number; interest: number; closing: number }[];
}

export type WarningCode =
  | 'AFFORDABLE_CLIFF' | 'JANTRI_ABOVE_AV' | 'TDS_APPLIES' | 'HIGH_LOADING'
  | 'AV_OVERRIDE_DIFF' | 'MAINT_GST' | 'LOAN_CAPPED' | 'EMI_INCOME_HIGH'
  | 'VIGHA_VARIES' | 'NEED_SBU' | 'NEED_CARPET' | 'SELLER_NRI';

export interface Warning { code: WarningCode; params?: Record<string, string | number> }

export interface CalculatorResult {
  area: AreaResult;
  cost: CostResult | null;       // null if baseRate missing or billing area unknown
  loan: LoanResult | null;
  warnings: Warning[];
}
```

---

## 5. Config (`src/engine/config.ts`)

```ts
export const RATES_UPDATED_ON = '2026-11-24';

export const SQFT_PER_SQM = 10.763910416709722; // 1 / 0.09290304

export const SQFT_PER_UNIT = {
  sqft: 1,
  sqm: SQFT_PER_SQM,
  sqyd: 9,                         // vaar / gaj
  guntha: 1089,
  are: 100 * SQFT_PER_SQM,
  acre: 43560,
  hectare: 10000 * SQFT_PER_SQM,
  cent: 435.6,
  ground: 2400,
  marla: 272.25,
  kanal: 5445,
  // vigha resolved via VIGHA_VARIANTS
} as const;

export const VIGHA_VARIANTS = {
  v17424: { sqft: 17424, label: 'Ahmedabad / North Gujarat (16 guntha)' }, // default
  v21780: { sqft: 21780, label: '20-guntha vigha' },
  v16875: { sqft: 16875, label: 'Central Gujarat' },
  v23958: { sqft: 23958, label: 'South Gujarat' },
} as const;

export const GUJARAT_UNITS: AreaUnit[] = ['sqft','sqm','sqyd','guntha','are','acre','hectare','vigha'];
export const OTHER_STATE_UNITS: AreaUnit[] = ['cent','ground','marla','kanal'];

export const GST = {
  underConstructionPct: 5,
  affordablePct: 1,
  readyPct: 0,
  affordableMaxCarpetSqm: 90,      // non-metro (Ahmedabad); inclusive
  affordableMaxValue: 4_500_000,   // inclusive
  commercialDefaultPct: 12,        // TODO(spec): verify vs GST 2.0 before launch
  servicesPct: 18,
  maintenanceExemptPerMonth: 7_500,
} as const;

export const STAMP_DUTY_PCT = 4.9;
export const REGISTRATION_PCT = 1;
export const REGISTRATION_CAP: number | null = null;

export const TDS = { pct: 1, threshold: 5_000_000 } as const;

// RBI LTV slabs: loan <= 30L -> 90%, 30L-75L -> 80%, > 75L -> 75%
export const LTV_SLABS = [
  { maxLoan: 3_000_000, ltv: 0.9 },
  { maxLoan: 7_500_000, ltv: 0.8 },
  { maxLoan: Infinity, ltv: 0.75 },
] as const;

export const LOAN_DEFAULTS = { ratePct: 8.0, tenureYears: 20, processingFeePct: 0.5 } as const;

export const WARN = {
  affordableCliffBandPct: 5,   // AV within 5% of 45L
  highLoadingPct: 50,
  highKapatPct: 33,
  avOverrideDiffPct: 1,
  emiIncomeHighPct: 50,
} as const;
```

---

## 6. Engine algorithms

### 6.1 Units (`units.ts`)

```ts
export function sqftPerUnit(unit: AreaUnit, vigha: VighaVariant): number
// vigha -> VIGHA_VARIANTS[vigha].sqft, else SQFT_PER_UNIT[unit]

export function convert(value: number, from: AreaUnit, to: AreaUnit, vigha: VighaVariant): number
// value * sqftPerUnit(from) / sqftPerUnit(to)   (no rounding)

export function convertToAll(value: number, from: AreaUnit, vigha: VighaVariant): Record<AreaUnit, number>
```

Display rounding: ≥ 1000 → 0 decimals; ≥ 1 → 2 decimals; < 1 → 4 significant digits. Also a length helper `lengthToArea(l, w, 'ft'|'m'|'yd') -> sqft` (1 ft = 0.3048 m, 1 yd = 3 ft).

### 6.2 Areas (`areas.ts`)

```ts
export function resolveAreas(a: AreaInput): AreaResult
```

1. `toSqft = (x) => x * sqftPerUnit(a.unit, a.vighaVariant)`; `extras = balcony + wash + terrace`.
2. Common-area fractions from `pct` (if `pct` is null both are null):
   - mode `loading`: `L = pct/100`, `K = L/(1+L)`
   - mode `kapat`: `K = pct/100` (must be < 1), `L = K/(1-K)`
3. By `knownType`:
   - `carpet`: `C = toSqft(value)`; `S = L != null ? C*(1+L) : null`
   - `sbu`: `S = toSqft(value)`; `C = K != null ? S*(1-K) : null`
   - `reraArea`: `C = toSqft(value) - extras`; `S = L != null ? C*(1+L) : null`
   - `carpetAndSbu`: `C = toSqft(value)`; `S = toSqft(sbuValue)`; derive `L = (S-C)/C`, `K = (S-C)/S` (ignore `pct`)
4. `reraArea = C + extras`; `commonArea = S - C`; `loadingPct = L*100`; `kapatPct = K*100`; `efficiencyPct = C/S*100`. Any field whose inputs are null is null.
5. Validation (return nulls + let UI show field errors): value ≤ 0, loading outside 0–150, kapat outside 0–60, reraArea leading to C ≤ 0, S < C.

### 6.3 Add-on row amount

```ts
export function rowAmount(row: AddOnRow, C: number | null, S: number | null, basePrice: number): number | null
```

- `perSqftSbu`: `row.amount * S` (null if S null → warning NEED_SBU)
- `perSqftCarpet`: `row.amount * C` (null if C null → NEED_CARPET)
- `lumpSum`: `row.amount`
- `pctOfBase`: `row.amount / 100 * basePrice`
- `perSqftMonth`: `row.amount * (monthlyAreaBasis === 'carpet' ? C : S) * (row.months ?? 0)`

Rows with amount 0 are omitted from the cost sheet output.

### 6.4 Cost sheet (`costSheet.ts`) — follow this order exactly

```ts
export function calculateCost(c: CostInput, area: AreaResult): { result: CostResult | null; warnings: Warning[] }
```

1. `C = area.carpetSqft`, `S = area.sbuSqft`. `billingArea = rateBasis === 'sbu' ? S : C`. If `baseRate` null or `billingArea` null → return `null` (+ NEED_SBU / NEED_CARPET warning).
2. `basePrice = round(billingArea * baseRate)`.
3. `frc = round(billingArea * frcRatePerFloor * max(0, floor - frcBaseFloor))`. Omit line if 0.
4. For every add-on: `amount = round(rowAmount(...))`.
5. `computedAV = basePrice + frc + Σ amount of rows with inAgreementValue`.
6. If `agreementValueOverride` is set: `AV = override`, and add a block-A line `avAdjustment = AV - computedAV` labelled "Adjustment to agreement value (as per your agreement)" when non-zero. Else `AV = computedAV`.
7. Property GST %:
   - `status === 'ready'` → 0
   - `propertyType` is `commercialOffice` or `shop` → `commercialGst`
   - `C != null && C / SQFT_PER_SQM <= 90 && AV <= 4_500_000` → 1 (`isAffordable = true`)
   - else → `overrides.gstUnderConstructionPct ?? 5`
8. `gstOnAV = round(AV * gstPct / 100)`.
9. Each non-AV row: `rowGstPct = row.gst === 'auto' ? propertyGstPct : row.gst`; `rowGst = round(amount * rowGstPct / 100)`.
10. `payableToBuilder = AV + gstOnAV + Σ(nonAV amount + rowGst)`.
11. Jantri: `jantriValue = c.jantriValue ?? (jantriRatePerSqm != null ? round(jantriRatePerSqm * (jantriAreaSqm ?? C / SQFT_PER_SQM)) : null)`.
12. `stampValue = max(AV, jantriValue ?? 0)`.
13. `stampDuty = round(stampValue * (overrides.stampDutyPct ?? 4.9) / 100)`.
14. `registration = buyerType === 'soleWoman' ? 0 : round(stampValue * (overrides.registrationPct ?? 1) / 100)`, then `min(registration, cap)` if a cap is set.
15. `allInCost = payableToBuilder + stampDuty + registration`.
16. TDS (information only, NOT added to any total): `base = max(AV, stampValue)`; `applies = base >= 5_000_000`; `amount = applies ? round(base * 0.01) : 0`.
17. `effectiveRatePerCarpetSqft = allInCost / C`, `effectiveRatePerSbuSqft = allInCost / S` (null if area null; round to rupee for display). `overHeadlinePct = (allInCost / basePrice - 1) * 100`.

Line blocks: base, frc, in-AV rows, avAdjustment, gstAv → block A. Non-AV rows (each with its GST) → block B. Stamp duty, registration → block C.

### 6.5 Loan (`loan.ts`)

```ts
export function maxEligibleLoan(V: number): number {
  return Math.max(Math.min(0.9 * V, 3_000_000), Math.min(0.8 * V, 7_500_000), 0.75 * V);
}
export function emi(P: number, annualPct: number, months: number): number {
  const r = annualPct / 12 / 100;
  if (r === 0) return P / months;
  const f = Math.pow(1 + r, months);
  return (P * r * f) / (f - 1);
}
```

- `V = loan.valueOverride ?? cost.agreementValue`.
- `requested` = mode `maxEligible` → max; `percent` → V × percent/100; `amount` → amount. `loanAmount = min(requested, max)`; `capped = requested > max` (→ LOAN_CAPPED).
- `n = tenureYears × 12`. `emiRaw = emi(...)`; `emi = round(emiRaw)`; `totalInterest = round(emiRaw × n − P)`; `totalRepayment = P + totalInterest`.
- `processingFee = round(P × fee/100)`; `upfrontCash = allInCost − P + processingFee`.
- `emiToIncomePct = monthlyIncome ? emiRaw / monthlyIncome × 100 : null` (> 50 → EMI_INCOME_HIGH).
- Yearly amortisation: iterate months with unrounded values, aggregate per year, round for display.
- If cost is null but `valueOverride` set, loan still computes (upfrontCash = null-safe: use V instead of allInCost and label it "excluding taxes").

### 6.6 Rounding rule

Round each line amount and each line's GST to the nearest rupee (`Math.round`). Subtotals and totals are sums of the rounded lines. Ratios (effective rate, %) use the rounded totals.

### 6.7 Warnings (`warnings.ts`)

| Code | Condition | Params |
|---|---|---|
| AFFORDABLE_CLIFF | status UC, residential, carpet ≤ 90 sqm, and AV between 95% and 105% of 45L | av |
| JANTRI_ABOVE_AV | jantriValue > AV | jantri, av |
| TDS_APPLIES | tds.applies | amount |
| HIGH_LOADING | loadingPct > 50 or kapatPct > 33 | loading, kapat |
| AV_OVERRIDE_DIFF | override set and abs(override − computed)/computed > 1% | override, computed |
| MAINT_GST | an `advanceMaint` (or any perSqftMonth) row's monthly amount (rate × area) > 7,500 | monthly |
| LOAN_CAPPED | requested > max | max, ltv |
| EMI_INCOME_HIGH | emiToIncomePct > 50 | pct |
| VIGHA_VARIES | unit `vigha` used anywhere | — |
| NEED_SBU / NEED_CARPET | an input needs an area that is null | — |
| SELLER_NRI | UI toggle "Seller is NRI" on | — |

### 6.8 Format (`format.ts`)

- `formatINR(n)` → `new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 })`.
- `formatINRWords(n)`: ≥ 1e7 → `₹X.XX Cr`; ≥ 1e5 → `₹X.XX L`; else `formatINR`.
- `formatArea(n, unit)` with en-IN grouping and §6.1 decimals.

---

## 7. UI specification

### 7.0 Default input (`state/defaults.ts`)

All numeric inputs empty/0 except: unit `sqft`, mode `loading`, rateBasis `sbu`, status `underConstruction`, buyerType `male`, commercialGst 12, vighaVariant `v17424`, loan defaults from config, loan mode `maxEligible`. Preset add-on rows exist with **amount 0** and these flags:

| presetKey | name | basis | inAV | gst | refundable |
|---|---|---|---|---|---|
| plc | PLC (preferential location) | perSqftSbu | true | auto | false |
| parking | Car parking | lumpSum | true | auto | false |
| club | Club membership | lumpSum | false | 18 | false |
| devPackage | Development package (AUDA/AMC, Torrent/UGVCL, water, drainage, gas) | lumpSum | false | 0 | false |
| maintDeposit | Maintenance deposit / corpus | perSqftSbu | false | 0 | true |
| advanceMaint | Advance running maintenance | perSqftMonth (months 24, monthlyAreaBasis sbu) | false | 18 | false |
| legal | Legal & documentation | lumpSum | false | 0 | false |

"Example" button loads fixture T1 (§12). "Reset" restores defaults.

### 7.1 Layout

- Header: brand name (from `brand.ts`), tagline "Know the real price of your Ahmedabad home".
- Tabs: **Area & Units** · **Cost Sheet** · **Loan & EMI**. Areas flow into the cost sheet; AV and all-in flow into the loan tab. All fields stay editable.
- Mobile: sticky bottom bar with "All-in ₹X" (gold) + "Talk to an advisor" button. Desktop: inputs left, results right (sticky).
- Footer: disclaimer (§11.1), link to /terms, "Rates updated on {RATES_UPDATED_ON}".

### 7.2 Area & Units tab

- Segmented control: "I know: Carpet | Super built-up | RERA area | Both carpet & SBU".
- Area value + unit select (Gujarat units first, "More units" group for others).
- Toggle Loading / Kapat + % input (hidden for "Both"). Show the other % read-only beneath: "= 25.93% kapat".
- Collapsible "Balcony, wash, terrace" (sq ft).
- **Result card:** rows Carpet, RERA area, SBU, Common area × columns sq ft / sq m / sq yd; chips for loading %, kapat %, efficiency %. Explainer: "For every 100 sq ft you pay for, you use {efficiency} sq ft."
- **Unit converter** section (independent): value + from-unit → list of all units; vigha variant select + VIGHA_VARIES warning; length helper (L × W in ft/m/yd → area).

### 7.3 Cost Sheet tab

Inputs (top to bottom): property type, project name (optional), base rate + basis toggle (read-only equivalent rate on the other basis: `carpetRate = sbuRate × S / C`), floor / FRC base floor / FRC rate, status toggle, buyer type, "Add charges from your builder's quote" (collapsible list of add-on rows; each row editable inline: name, basis, amount, months if monthly, in-AV toggle, GST select, refundable toggle, delete; "+ Add custom charge"), "Agreement value (optional)" field with helper "If your agreement states a value, enter it — taxes are calculated on it", Jantri (value OR rate/sqm + area sqm) with link "Check Jantri on GARVI" → https://garvi.gujarat.gov.in, "Seller is NRI" toggle, Advanced panel (stamp duty %, registration %, registration cap, under-construction GST %).

Outputs: cost-sheet table with blocks A/B/C (columns: Item, Calculation, Amount, GST, Total), subtotals, **All-in cost** large in gold with words; TDS line greyed beneath with explanation; three tiles (₹/carpet sq ft, ₹/SBU sq ft, % over headline); composition bar (Base+FRC+PLC, other charges, GST, stamp+registration); warnings as banners.

### 7.4 Loan & EMI tab

Inputs per `LoanInput`. Outputs: tiles (Loan + LTV %, EMI/month, Total interest, Total repayment, Upfront cash needed), principal-vs-interest bar, collapsible yearly amortisation table. Always show: "Rates and eligibility are set by your lender. This is an estimate."

### 7.5 Accessibility and behaviour

Every input has a `<label>`; tooltip ⓘ next to each term from `glossary.ts`; full keyboard navigation; focus ring gold; numbers in inputs accept commas and format on blur (en-IN); invalid values show inline errors and never crash the engine.

---

## 8. Theme: black and gold

Tailwind tokens:

| Token | Hex | Use |
|---|---|---|
| `bg` | #0B0B0B | page |
| `surface` | #151515 | cards, inputs |
| `surface-2` | #1C1C1C | hovered rows, table stripes |
| `border` | #2A2A2A | dividers, input borders |
| `gold` | #D4AF37 | all-in total, primary buttons, active tab, focus ring |
| `gold-muted` | #A8893A | secondary highlights, icons |
| `text` | #F5F2EA | body |
| `text-muted` | #9A968C | labels, helper text |
| `warn` | #E0A43A | warning banners |
| `error` | #E5484D | validation |

- Primary button: gold background, black text. Secondary: gold 1px outline, gold text.
- Headings and the all-in total: Cormorant Garamond 600. Everything else: Inter with `font-variant-numeric: tabular-nums`.
- Gold body text only on `bg` (contrast ≈ 9:1). Charts: gold + two greys only.
- Dark theme only in v1.

---

## 9. Share and export

| Action | Spec |
|---|---|
| Copy link | URL `/?s=<lz-string compressToEncodedURIComponent(JSON.stringify(input))>`. On load, decode, validate with zod (schema version `v: 1`); on failure load defaults and show a toast. Update URL with `history.replaceState` debounced 500 ms. |
| Download PDF | A4 portrait, `@react-pdf/renderer`. Black header band with brand name in gold; white body with gold rules (print-friendly; TODO(spec): confirm). Contents: project name, date, area table, cost sheet (blocks A/B/C), all-in total, effective rates, TDS note, loan summary (if any), disclaimer §11.1, share link as text. File name `cost-sheet-{project or 'property'}-{yyyy-mm-dd}.pdf`. |
| Save image | PNG 1080×1350 of a summary card (area, all-in, effective carpet rate, EMI, brand). |
| WhatsApp | `https://wa.me/?text=` + encoded summary (§11.3) + share link. |

---

## 10. Advisor lead form

- Button label: **"Confused? Talk to our expert advisor"**. Opens a dialog.
- Fields: name (required, 2–80 chars), phone (required; strip spaces/`+91`/leading 0; must match `^[6-9]\d{9}$`), email (optional, valid), preferred time (select: Morning / Afternoon / Evening / Any), message (optional, ≤ 500), checkbox "Attach my calculation" (default on), hidden honeypot `company`.
- `POST /api/lead` body:
  ```json
  { "name": "", "phone": "9XXXXXXXXX", "email": "", "preferredTime": "Any", "message": "",
    "shareUrl": "https://.../?s=...", "summary": { "allInCost": 0, "carpetSqft": 0, "projectName": "" },
    "company": "" }
  ```
- Server: zod-validate; if honeypot filled → return 200 and drop; rate-limit 5 requests / 10 min / IP (in-memory is acceptable for v1); forward JSON to `LEAD_WEBHOOK_URL` (POST, 5 s timeout). If the env var is missing, `console.info` the lead and return 200. Responses: `200 {ok:true}`, `400 {ok:false, errors}`, `429`, `502` (webhook failed).
- Success state: "Thanks! Our advisor will call you soon." + "Chat on WhatsApp" button → `https://wa.me/{BRAND.advisorWhatsApp}?text=` prefilled with name + share link (hidden if number not configured).
- Placement: sticky bar (mobile), card below the all-in total, and inside warnings SELLER_NRI and AV_OVERRIDE_DIFF.

---

## 11. Copy (`content/copy.ts`)

### 11.1 Disclaimer (every result view, PDF, image footer)

> Figures are indicative estimates based on the values you entered and Gujarat rates as of {RATES_UPDATED_ON}. Builder charges (PLC, FRC, deposits, maintenance, development and other charges) vary by project and are not regulated amounts. Stamp duty is charged on the higher of agreement value and Jantri value. GST, stamp duty and loan terms may change. Confirm every amount with the developer, your lender and a legal or tax advisor before you pay. This is not legal, tax or financial advice.

### 11.2 Warning texts

| Code | Text |
|---|---|
| AFFORDABLE_CLIFF | "Your agreement value is close to ₹45 lakh. Above ₹45 lakh, GST rises from 1% to 5%." |
| JANTRI_ABOVE_AV | "Jantri value ({jantri}) is higher than your agreement value, so stamp duty and registration are charged on Jantri." |
| TDS_APPLIES | "Price is ₹50 lakh or more: deduct 1% TDS ({amount}) from your payment to the builder and file Form 26QB. This is not an extra cost." |
| HIGH_LOADING | "High loading ({loading}% / kapat {kapat}%). Compare projects on the carpet rate, not the SBU rate." |
| AV_OVERRIDE_DIFF | "Your agreement value ({override}) differs from the calculated value ({computed}). Taxes use your agreement value." |
| MAINT_GST | "Monthly maintenance ({monthly}) is above ₹7,500, so the society bill will attract 18% GST on the full amount." |
| LOAN_CAPPED | "Loan capped at {max}: RBI allows up to {ltv}% of the property value for this loan size." |
| EMI_INCOME_HIGH | "EMI is {pct}% of your income. Banks usually keep EMIs under about half of income." |
| VIGHA_VARIES | "Vigha size differs by region. For legal use, rely on guntha or sq m from the 7/12 record." |
| NEED_SBU | "Enter loading/kapat or the super built-up area to use SBU-based rates." |
| NEED_CARPET | "Enter the carpet area to use carpet-based rates." |
| SELLER_NRI | "Buying from an NRI seller needs higher TDS on capital gains and a TAN. Talk to our advisor." |

### 11.3 WhatsApp summary

```
{projectName or "Property"} — cost estimate
Carpet {carpet} sq ft · SBU {sbu} sq ft
All-in cost: {allIn} ({allInWords})
Effective: {ratePerCarpet}/sq ft carpet
EMI: {emi}/month ({tenure} yrs @ {rate}%)
Full breakup: {shareUrl}
```

---

## 12. Test fixtures (`src/engine/__tests__/fixtures.ts`) — all must pass

**T1 reference (3BHK, under construction).** Input: knownType carpet, value 1200 sqft, loading 35%; baseRate 6500 on SBU; floor 8, frcBaseFloor 4, frcRatePerFloor 25; add-ons: plc 100 perSqftSbu (inAV, auto), devPackage 105000 lumpSum (0%), legal 25000 lumpSum (0%), maintDeposit 50 perSqftSbu (0%, refundable), advanceMaint 2.5 perSqftMonth × 24 on SBU (18%); buyer male; no Jantri; no override; loan maxEligible, 8%, 20 yrs, fee 0.5%.

| Field | Expected |
|---|---|
| sbuSqft | 1620 |
| kapatPct | 25.926 (±0.001) |
| basePrice | 10530000 |
| frc | 162000 |
| PLC line | 162000 |
| agreementValue | 10854000 |
| propertyGstPct | 5 |
| gstOnAgreementValue | 542700 |
| devPackage / legal / maintDeposit lines | 105000 / 25000 / 81000 |
| advanceMaint line / its GST | 97200 / 17496 |
| payableToBuilder | 11722396 |
| stampDuty | 531846 |
| registration | 108540 |
| allInCost | 12362782 |
| tds | applies, base 10854000, amount 108540 |
| effectiveRatePerCarpetSqft | 10302 (rounded) |
| effectiveRatePerSbuSqft | 7631 (rounded) |
| overHeadlinePct | 17.40 (±0.01) |
| maxEligible / loanAmount | 8140500 |
| emi | 68090 |
| totalInterest | 8201197 |
| processingFee | 40703 |
| upfrontCash | 12362782 − 8140500 + 40703 = 4262985 |
| warnings include | TDS_APPLIES |

**Variants (each = T1 with one change):**

| ID | Change | Expected |
|---|---|---|
| T2 | buyerType soleWoman | registration 0; allInCost 12254242 |
| T3 | status ready | gstOnAgreementValue 0; allInCost 11820082 |
| T4 | jantriValue 12000000 | stampValue 12000000; stampDuty 588000; registration 120000; allInCost 12430396; warning JANTRI_ABOVE_AV; tds.base 12000000, tds.amount 120000 |
| T5 | carpetAndSbu: carpet 800, sbu 1080; baseRate 4000 SBU; all add-ons 0; floor 0; frc 0 | AV 4320000; isAffordable true; GST 1% = 43200; stampDuty 211680; registration 43200; allInCost 4618080; carpet-equivalent rate 5400; tds.applies false; warning AFFORDABLE_CLIFF |
| T6 | area only: knownType sbu, value 1500, mode kapat, pct 40 | carpetSqft 900; loadingPct 66.667 (±0.001) |
| T7 | maxEligibleLoan(3600000) / maxEligibleLoan(9500000) | 3000000 / 7500000 |
| T8 | convert(1, 'vigha', x, 'v17424') | sqft 17424; sqyd 1936; guntha 16; acre 0.4 |
| T9 | T1 with agreementValueOverride 11000000 | AV 11000000; avAdjustment line 146000; gstOnAgreementValue 550000; stampDuty 539000; registration 110000; warning AV_OVERRIDE_DIFF |
| T10 | T1 with propertyType commercialOffice (commercialGst 12) | propertyGstPct 12; gstOnAgreementValue 1302480 |
| T11 | emi(100000, 0, 120) | 833.33 (±0.01) |
| T12 | formatINR(12362782) / formatINRWords(12362782) / formatINRWords(4618080) | "₹1,23,62,782" / "₹1.24 Cr" / "₹46.18 L" |

E2E smoke (Playwright): (1) click "Example" → all-in shows ₹1,23,62,782; (2) copy-link URL opened in a new page restores the same all-in.

---

## 13. Milestones and checklist

- [ ] **M1 Engine:** types, config, units, areas, costSheet, loan, warnings, format, `calculate()`; all §12 unit tests green.
- [ ] **M2 Shell + theme:** Next.js app, Tailwind tokens §8, fonts, header/tabs/footer, sticky bar, disclaimer, /terms page.
- [ ] **M3 Area & Units tab** per §7.2.
- [ ] **M4 Cost Sheet tab** per §7.3, add-on rows CRUD, Advanced panel, warnings.
- [ ] **M5 Loan & EMI tab** per §7.4 with amortisation.
- [ ] **M6 Share:** URL state, PDF, PNG, WhatsApp; e2e test 2 green.
- [ ] **M7 Advisor:** dialog, `/api/lead`, rate limit, honeypot, WhatsApp follow-up.
- [ ] **M8 Polish:** analytics events (`calc_complete`, `export_pdf`, `export_png`, `share_whatsapp`, `copy_link`, `advisor_open`, `lead_submit`), SEO metadata + OG image, Lighthouse ≥ 90, README with setup and env vars.

---

## 14. Placeholders and environment

`src/config/brand.ts`:

```ts
export const BRAND = {
  name: 'TODO_BRAND_NAME',            // TODO(owner)
  tagline: 'Know the real price of your Ahmedabad home',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  advisorWhatsApp: process.env.NEXT_PUBLIC_ADVISOR_WHATSAPP ?? '', // e.g. 919XXXXXXXXX; empty hides button
  logoPath: '/logo.svg',              // TODO(owner): replace placeholder logo
};
```

Env vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADVISOR_WHATSAPP`, `LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Provide `.env.example`.

Open decisions (owner will fill; build with the defaults shown):

| Decision | Default to build with |
|---|---|
| Brand name / domain / logo | Placeholders above |
| Lead destination | Generic JSON webhook (`LEAD_WEBHOOK_URL`) |
| PDF style | Black header band + white body with gold accents |
| TDS base | max(AV, stamp value) |
| Commercial GST default | 12% (in config, flagged) |
| Vigha default | 17,424 sq ft |
| Jantri | Manual input only (2023 rates assumed) |

---

## 15. Glossary (`content/glossary.ts`, used for tooltips)

| Key | Term | Tooltip |
|---|---|---|
| carpet | Carpet area (RERA) | Usable floor area including internal walls. Excludes external walls, shafts, balcony and terrace. |
| reraArea | RERA area | Carpet + balcony + wash + terrace, as shown on many Ahmedabad brochures. |
| sbu | Super built-up (SBU) | Carpet plus your share of lobbies, stairs, lifts and amenities. Most quotes are priced on it. |
| loading | Loading | Common area as a % of carpet. SBU = carpet × (1 + loading). |
| kapat | Kapat (કપાત) | Deduction: common area as a % of SBU. Carpet = SBU × (1 − kapat). In land, also the ~40% TP-scheme cut. |
| plc | PLC | Preferential location charge for garden, corner, road or view-facing units. |
| frc | FRC | Floor rise charge: ₹ per sq ft for each floor above a base floor. |
| av | Agreement value | Price written in the sale agreement. GST and stamp duty are charged on it. |
| jantri | Jantri | Gujarat government's minimum property rate. Stamp duty is on the higher of agreement value and Jantri value. |
| sv | Stamp value | The higher of agreement value and Jantri value. |
| bu | BU permission | Building-use (completion) permission. After it, buying from the builder has no GST. |
| maintDeposit | Maintenance deposit / corpus | One-time fund later handed to the society. |
| advanceMaint | Advance maintenance | Running maintenance collected upfront, usually for 12–24 months. |
| gst | GST | 5% on under-construction homes, 1% on affordable homes (carpet ≤ 90 sq m and price ≤ ₹45 L), 0% after BU. |
| stampDuty | Stamp duty | 4.9% in Gujarat (3.5% + 40% surcharge). |
| registration | Registration fee | 1% in Gujarat; waived for a sole woman buyer. |
| tds | TDS | 1% the buyer deducts and pays to the government when price is ₹50 L or more. Not an extra cost. |
| ltv | LTV | Loan-to-value: RBI lets banks lend up to 90% (≤ ₹30 L), 80% (₹30–75 L) or 75% (> ₹75 L). |
| vaar | Vaar / gaj | Square yard = 9 sq ft. |
| guntha | Guntha | 1,089 sq ft; 40 guntha = 1 acre. |
| vigha | Vigha / bigha | Land unit; 17,424 sq ft in Ahmedabad, but varies by region. |
