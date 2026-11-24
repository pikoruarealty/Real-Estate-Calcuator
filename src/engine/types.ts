export type AreaUnit =
  | 'sqft' | 'sqm' | 'sqyd' | 'guntha' | 'are' | 'acre' | 'hectare'
  | 'vigha' | 'cent' | 'ground' | 'marla' | 'kanal';

export type VighaVariant = 'v17424' | 'v21780' | 'v16875' | 'v23958';

export type KnownAreaType = 'carpet' | 'sbu' | 'reraArea' | 'carpetAndSbu';
export type CommonAreaMode = 'loading' | 'kapat';

export interface AreaInput {
  knownType: KnownAreaType;
  value: number | null; // the known area (carpet, sbu or reraArea)
  unit: AreaUnit; // unit of `value` (and of `sbuValue`)
  sbuValue: number | null; // only used when knownType === 'carpetAndSbu' (value = carpet)
  mode: CommonAreaMode;
  pct: number | null; // loading % or kapat %, per `mode`; ignored for 'carpetAndSbu'
  balconySqft: number; // default 0
  washSqft: number; // default 0
  terraceSqft: number; // default 0
  vighaVariant: VighaVariant; // default 'v17424'
}

export interface AreaResult {
  carpetSqft: number | null;
  sbuSqft: number | null;
  reraAreaSqft: number | null; // carpet + balcony + wash + terrace
  commonAreaSqft: number | null; // sbu - carpet
  loadingPct: number | null; // (sbu - carpet) / carpet * 100
  kapatPct: number | null; // (sbu - carpet) / sbu * 100
  efficiencyPct: number | null; // carpet / sbu * 100
}

export type PropertyType = 'flat' | 'penthouse' | 'commercialOffice' | 'shop';
export type RateBasis = 'sbu' | 'carpet';
export type ConstructionStatus = 'underConstruction' | 'ready';
export type BuyerType = 'male' | 'soleWoman' | 'joint' | 'company';
export type CommercialGst = 5 | 12;

export type AddOnBasis =
  | 'perSqftSbu' // amount x SBU
  | 'perSqftCarpet' // amount x carpet
  | 'lumpSum' // amount
  | 'pctOfBase' // amount% x base price
  | 'perSqftMonth'; // amount x area(monthlyAreaBasis) x months

export type GstChoice = 'auto' | 0 | 5 | 18;

export type PresetKey =
  | 'plc' | 'parking' | 'club' | 'devPackage'
  | 'maintDeposit' | 'advanceMaint' | 'legal';

export interface AddOnRow {
  id: string; // stable uuid
  presetKey?: PresetKey; // set for preset rows
  name: string;
  basis: AddOnBasis;
  amount: number; // 0 = row contributes nothing
  months?: number; // required when basis === 'perSqftMonth'
  monthlyAreaBasis?: RateBasis; // default 'sbu'
  inAgreementValue: boolean;
  gst: GstChoice; // 'auto' = property GST slab
  refundable: boolean; // display label only
}

export interface StatutoryOverrides {
  stampDutyPct?: number;
  registrationPct?: number;
  registrationCap?: number | null;
  gstUnderConstructionPct?: number;
}

export interface CostInput {
  propertyType: PropertyType;
  baseRate: number | null; // Rs per sqft
  rateBasis: RateBasis;
  floor: number; // default 0
  frcBaseFloor: number; // default 0
  frcRatePerFloor: number; // Rs per sqft per floor, default 0
  status: ConstructionStatus;
  buyerType: BuyerType;
  commercialGst: CommercialGst; // default 12, used only for commercialOffice/shop
  agreementValueOverride: number | null;
  jantriValue: number | null; // direct Rs value; takes priority over rate
  jantriRatePerSqm: number | null;
  jantriAreaSqm: number | null; // default = carpet in sqm
  addOns: AddOnRow[];
  projectName: string; // optional, printed on PDF
  overrides: StatutoryOverrides; // Advanced panel, all optional
  sellerNri?: boolean; // UI toggle "Seller is NRI" (drives SELLER_NRI warning)
}

export interface LoanInput {
  valueOverride: number | null; // default null -> use agreement value
  mode: 'maxEligible' | 'percent' | 'amount';
  percent: number | null;
  amount: number | null;
  ratePct: number; // default 8.0
  tenureYears: number; // default 20
  processingFeePct: number; // default 0.5
  monthlyIncome: number | null;
}

export interface CalculatorInput {
  v: 1; // schema version for URL state
  area: AreaInput;
  cost: CostInput;
  loan: LoanInput;
}

export interface CostLine {
  key: string; // 'base' | 'frc' | 'avAdjustment' | row.id | 'gstAv' | 'stampDuty' | 'registration'
  label: string;
  calc: string; // human-readable calculation, e.g. "1,620 sq ft × ₹6,500"
  amount: number; // rounded rupees
  gstPct?: number;
  gstAmount?: number; // rounded
  block: 'A' | 'B' | 'C'; // A = agreement value, B = other builder charges, C = government
  refundable?: boolean;
}

export interface CostResult {
  lines: CostLine[];
  basePrice: number;
  frc: number;
  computedAgreementValue: number;
  agreementValue: number; // override if given, else computed
  propertyGstPct: number; // 0 | 1 | 5 | 12
  isAffordable: boolean;
  gstOnAgreementValue: number;
  otherChargesTotal: number; // block B amounts excl. GST
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
  emi: number; // rounded
  totalInterest: number; // rounded, from unrounded EMI
  totalRepayment: number;
  processingFee: number;
  upfrontCash: number; // allInCost - loan + processingFee
  /** true when no cost sheet exists and upfrontCash uses the property value (excluding taxes) */
  upfrontExcludesTaxes?: boolean;
  emiToIncomePct: number | null;
  yearly: { year: number; opening: number; principal: number; interest: number; closing: number }[];
}

export type WarningCode =
  | 'AFFORDABLE_CLIFF' | 'JANTRI_ABOVE_AV' | 'TDS_APPLIES' | 'HIGH_LOADING'
  | 'AV_OVERRIDE_DIFF' | 'MAINT_GST' | 'LOAN_CAPPED' | 'EMI_INCOME_HIGH'
  | 'VIGHA_VARIES' | 'NEED_SBU' | 'NEED_CARPET' | 'SELLER_NRI';

export interface Warning {
  code: WarningCode;
  params?: Record<string, string | number>;
}

export interface CalculatorResult {
  area: AreaResult;
  cost: CostResult | null; // null if baseRate missing or billing area unknown
  loan: LoanResult | null;
  warnings: Warning[];
}
