/**
 * Plain-language explanations for every term, input and result in the app.
 * Written for a first-time home buyer: what it is, why it matters, where to find it.
 */
export type GlossaryGroup = 'Area & units' | 'Price & builder charges' | 'Taxes & government' | 'Loan';

export interface GlossaryEntry {
  term: string;
  tip: string;
  /** "Where do I find this?" or a short worked example */
  extra?: string;
  group: GlossaryGroup;
  /** hide from the A–Z glossary (input-specific help) */
  hidden?: boolean;
}

const A: GlossaryGroup = 'Area & units';
const P: GlossaryGroup = 'Price & builder charges';
const T: GlossaryGroup = 'Taxes & government';
const L: GlossaryGroup = 'Loan';

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // ── Area ────────────────────────────────────────────────────────────────
  knownType: {
    group: A, hidden: true,
    term: 'Which area do you know?',
    tip: 'Look at your brochure or the builder’s quote. If it says “carpet” or “RERA carpet”, pick Carpet. If it says “super built-up”, “SBU” or “saleable area”, pick Super built-up. If you have both numbers, pick Both — that is the most accurate.',
  },
  carpet: {
    group: A,
    term: 'Carpet area (RERA)',
    tip: 'The usable floor area inside your home’s walls — the space you can actually walk on. It includes internal walls but not outer walls, shafts, balcony or terrace. This is the honest measure of how big your home is.',
    extra: 'Where to find it: the RERA certificate, the sale agreement, or ask the builder for “RERA carpet area”.',
  },
  reraArea: {
    group: A,
    term: 'RERA area',
    tip: 'Carpet area + balcony + wash area + terrace. Many brochures print this number as “RERA area”, so it looks bigger than the pure carpet area.',
  },
  sbu: {
    group: A,
    term: 'Super built-up (SBU)',
    tip: 'Carpet area plus your share of common spaces — lobby, staircase, lifts, outer walls, clubhouse. You can’t use most of it privately, but most builders quote the price per SBU sq ft, which makes the rate look lower than it really is.',
    extra: 'Also called “saleable area” or “super area”.',
  },
  loading: {
    group: A,
    term: 'Loading %',
    tip: 'How much common area is added on top of your carpet area. SBU = carpet × (1 + loading).',
    extra: 'Example: 1,000 sq ft carpet with 40% loading = 1,400 sq ft SBU. Lower loading means you get more usable space for your money.',
  },
  kapat: {
    group: A,
    term: 'Kapat % (કપાત)',
    tip: 'The same idea as loading, seen from the other side: the share of the SBU that is NOT yours to use. Carpet = SBU × (1 − kapat).',
    extra: 'Example: 1,400 sq ft SBU with 28.6% kapat = 1,000 sq ft carpet. (In land deals, “kapat” also means the ~40% land cut in a TP scheme.)',
  },
  commonArea: {
    group: A,
    term: 'Common area',
    tip: 'SBU minus carpet: your share of lobbies, stairs, lifts, walls and amenities. You pay for it, but you don’t use it privately.',
  },
  efficiency: {
    group: A,
    term: 'Efficiency',
    tip: 'Carpet ÷ SBU, as a %. It tells you how much of what you pay for you can actually use inside your home. Higher is better.',
    extra: 'Example: 74% efficiency means for every 100 sq ft you pay for, you get 74 sq ft of usable space.',
  },
  extras: {
    group: A, hidden: true,
    term: 'Balcony, wash & terrace',
    tip: 'Open areas attached to your flat. Under RERA they are not part of carpet area, but many brochures add them to show “RERA area”. Enter them only if your brochure lists them separately.',
  },
  areaUnit: {
    group: A, hidden: true,
    term: 'Unit',
    tip: 'Flats are usually measured in sq ft. Plots often use sq yd (vaar / gaj). Farm land uses guntha, acre or vigha.',
  },
  converter: {
    group: A, hidden: true,
    term: 'Unit converter',
    tip: 'Convert any area between Indian units — useful when one document says sq m, the brochure says sq ft and the broker says vaar.',
  },
  lengthHelper: {
    group: A, hidden: true,
    term: 'Length × width',
    tip: 'Know a room’s or plot’s length and width? Multiply them to get its area. Pick the unit you measured in.',
  },
  u_sqft: { group: A, term: 'Square foot (sq ft)', tip: 'The most common unit for flats in India. A typical bedroom is about 120–150 sq ft.' },
  u_sqm: { group: A, term: 'Square metre (sq m)', tip: 'Metric unit used in government records and Jantri. 1 sq m ≈ 10.76 sq ft.' },
  u_sqyd: { group: A, term: 'Square yard (vaar / gaj)', tip: 'Common for plots. 1 sq yd = 9 sq ft.' },
  u_guntha: { group: A, term: 'Guntha', tip: 'Regional land unit. 1 guntha = 1,089 sq ft; 40 guntha = 1 acre.' },
  u_are: { group: A, term: 'Are', tip: 'Metric land unit = 100 sq m. Seen on some land records.' },
  u_acre: { group: A, term: 'Acre', tip: 'Land unit = 43,560 sq ft = 40 guntha.' },
  u_hectare: { group: A, term: 'Hectare', tip: 'Metric land unit = 10,000 sq m ≈ 2.47 acre.' },
  u_vigha: { group: A, term: 'Vigha / bigha', tip: 'Traditional land unit. 17,424 sq ft (16 guntha), but its size changes from region to region.', extra: 'For anything legal, rely on guntha or sq m from the 7/12 record.' },
  u_cent: { group: A, term: 'Cent', tip: 'Used in Kerala and Tamil Nadu. 1 cent = 1/100 acre = 435.6 sq ft.' },
  u_ground: { group: A, term: 'Ground', tip: 'Used in Chennai. 1 ground = 2,400 sq ft.' },
  u_marla: { group: A, term: 'Marla', tip: 'Used in Punjab and Haryana. Taken here as 272.25 sq ft (size varies locally).' },
  u_kanal: { group: A, term: 'Kanal', tip: 'Used in Punjab and Haryana. 1 kanal = 20 marla = 5,445 sq ft.' },
  vaar: { group: A, term: 'Vaar / gaj', tip: 'Local names for a square yard = 9 sq ft.' },
  guntha: { group: A, term: 'Guntha', tip: '1,089 sq ft; 40 guntha = 1 acre.' },
  vigha: { group: A, term: 'Vigha / bigha', tip: 'Land unit; 17,424 sq ft in some regions, but it varies by region.' },

  // ── Price & builder charges ─────────────────────────────────────────────
  propertyType: {
    group: P, hidden: true,
    term: 'Property type',
    tip: 'Flats and penthouses are homes (residential). Offices and shops are commercial and are taxed differently.',
  },
  projectName: {
    group: P, hidden: true,
    term: 'Project name',
    tip: 'Optional. Printed on your PDF and share image so you can compare projects later.',
  },
  baseRate: {
    group: P,
    term: 'Base rate',
    tip: 'The price per sq ft the builder quotes — the “headline” rate. It is never the final price: floor rise, extra charges, GST, stamp duty and registration all get added on top.',
    extra: 'Check whether the quote is per carpet or per super built-up sq ft. It changes the price a lot.',
  },
  rateBasis: {
    group: P, hidden: true,
    term: 'Rate is on',
    tip: 'Most builders quote per super built-up sq ft. If your quote says “per carpet sq ft”, switch to Carpet.',
  },
  basePrice: {
    group: P,
    term: 'Base price',
    tip: 'Area × base rate. The starting point of the price, before any other charges or taxes.',
  },
  floor: {
    group: P, hidden: true,
    term: 'Floor',
    tip: 'Which floor your flat is on. Enter 0 for the ground floor.',
  },
  frcBaseFloor: {
    group: P, hidden: true,
    term: 'Floor rise starts after floor',
    tip: 'Many builders charge more for higher floors. Enter the floor after which this extra charge starts.',
    extra: 'Example: 4 means floors 5 and above pay floor rise.',
  },
  frcRate: {
    group: P, hidden: true,
    term: 'Floor rise per floor',
    tip: '₹ per sq ft added for each floor above the starting floor.',
    extra: 'Example: ₹25 per floor, starting after floor 4, on the 8th floor = 4 floors × ₹25 = ₹100 per sq ft extra.',
  },
  frc: {
    group: P,
    term: 'Floor rise charge (FRC)',
    tip: 'Extra charge for living on a higher floor: ₹ per sq ft for each floor above a base floor. It is part of the agreement value, so GST and stamp duty apply to it too.',
  },
  status: {
    group: T, hidden: true,
    term: 'Construction status',
    tip: 'Under construction: GST applies to the price (usually 5%, or 1% for affordable homes). Ready (BU received): the building has its completion permission, so the flat price has no GST.',
  },
  buyerType: {
    group: T, hidden: true,
    term: 'Who will own the home',
    tip: 'In some states, a woman buying alone pays no registration fee, saving 1% of the property value. Men, joint buyers and companies pay the full fee.',
  },
  addOns: {
    group: P,
    term: 'Builder’s extra charges',
    tip: 'Besides the base price, builders add charges like parking, club membership, development charges and maintenance deposits. They can add up to lakhs.',
    extra: 'Ask the builder for a full “cost sheet” and copy each charge here. Leave a charge at 0 if it isn’t on your quote.',
  },
  plc: {
    group: P,
    term: 'PLC (preferential location charge)',
    tip: 'Extra charge for a “better” unit — garden-facing, corner, road-facing or with a view. Usually per sq ft and part of the agreement value.',
  },
  parking: {
    group: P,
    term: 'Car parking',
    tip: 'Fee for an allotted parking space. Often included in the agreement value, so GST and stamp duty apply to it.',
  },
  club: {
    group: P,
    term: 'Club membership',
    tip: 'One-time fee for the clubhouse, gym, pool and similar amenities. Usually charged separately, with 18% GST.',
  },
  devPackage: {
    group: P,
    term: 'Development package',
    tip: 'One-time charges for connecting your home to city infrastructure: AUDA/AMC development, electricity (Torrent/UGVCL), water, drainage and gas. Usually paid separately from the agreement value.',
  },
  maintDeposit: {
    group: P,
    term: 'Maintenance deposit / corpus',
    tip: 'A one-time fund the builder collects and later hands to the housing society for major repairs. It is refundable in the sense that it belongs to the society, but you still pay it upfront.',
  },
  advanceMaint: {
    group: P,
    term: 'Advance maintenance',
    tip: 'Running maintenance (security, cleaning, lifts, common electricity) collected upfront, usually for 12–24 months.',
    extra: 'If the monthly amount is above ₹7,500, 18% GST applies to the full amount.',
  },
  legal: {
    group: P,
    term: 'Legal & documentation',
    tip: 'Builder’s fee for preparing the sale agreement and other paperwork.',
  },
  custom: {
    group: P, hidden: true,
    term: 'Custom charge',
    tip: 'A charge you added from your builder’s quote.',
  },
  chargeName: {
    group: P, hidden: true,
    term: 'Charge name',
    tip: 'Name it the way your builder’s quote does, so it’s easy to match later.',
  },
  chargeBasis: {
    group: P, hidden: true,
    term: 'How it’s charged',
    tip: 'Per sq ft (multiplied by SBU or carpet area), a fixed lump sum, a % of the base price, or per sq ft per month (for maintenance). Copy whatever your quote says.',
  },
  chargeAmount: {
    group: P, hidden: true,
    term: 'Rate or amount',
    tip: 'The number from your builder’s quote. Leave it at 0 if this charge doesn’t apply to you.',
  },
  months: {
    group: P, hidden: true,
    term: 'Months',
    tip: 'How many months of maintenance the builder collects upfront. Usually 12 or 24.',
  },
  monthlyArea: {
    group: P, hidden: true,
    term: 'Area used',
    tip: 'Which area the builder multiplies the monthly rate by. Usually super built-up.',
  },
  inAV: {
    group: P, hidden: true,
    term: 'Included in agreement value',
    tip: 'Turn on if this charge is part of the price written in your sale agreement. Then GST, stamp duty and registration are charged on it too. Turn off if it’s paid to the builder separately.',
  },
  rowGst: {
    group: T, hidden: true,
    term: 'GST on this charge',
    tip: '“Same as property” uses your flat’s GST rate. Club membership and maintenance usually carry 18%. Deposits and pass-through government charges usually carry none.',
  },
  refundable: {
    group: P, hidden: true,
    term: 'Refundable',
    tip: 'Money you may get back or that is held on your behalf (like a deposit). You still pay it upfront, so it stays in your all-in cost.',
  },
  av: {
    group: T,
    term: 'Agreement value',
    tip: 'The price written in your sale agreement: base price + floor rise + any charges included in it. GST is charged on it, and stamp duty is charged on it (or on Jantri, if Jantri is higher).',
  },
  avOverride: {
    group: T, hidden: true,
    term: 'Agreement value (optional)',
    tip: 'Already have a draft agreement? Type the exact value written in it. GST and stamp duty will be calculated on that number instead of our estimate.',
  },
  avAdjustment: {
    group: T, hidden: true,
    term: 'Adjustment to agreement value',
    tip: 'The difference between the value in your agreement and the value we calculated from your inputs.',
  },
  jantri: {
    group: T,
    term: 'Jantri',
    tip: 'The government’s minimum rate for property in each area (also called the ready reckoner rate). Stamp duty is charged on the higher of your agreement value and the Jantri value.',
    extra: 'Look it up on your state’s official portal, or ask the builder.',
  },
  jantriValue: {
    group: T, hidden: true,
    term: 'Jantri value',
    tip: 'The total government value of your property. If you know it, enter it here and skip the rate fields.',
  },
  jantriRate: {
    group: T, hidden: true,
    term: 'Jantri rate',
    tip: 'Government rate per sq m for your area, from your state’s official portal. We multiply it by the area to get the Jantri value.',
  },
  jantriArea: {
    group: T, hidden: true,
    term: 'Area for Jantri',
    tip: 'Area in sq m used for the Jantri calculation. Leave blank to use your carpet area.',
  },
  sellerNri: {
    group: T, hidden: true,
    term: 'Seller is NRI',
    tip: 'Buying a resale home from someone who lives abroad? Different, higher TDS rules apply, and you need a TAN. Turn this on if the seller is an NRI.',
  },
  commercialGst: {
    group: T, hidden: true,
    term: 'GST on commercial property',
    tip: 'Offices and shops have a different GST rate from homes. Confirm the exact rate with the builder or a tax advisor.',
  },
  sv: {
    group: T,
    term: 'Stamp value',
    tip: 'The higher of the agreement value and the Jantri value. Stamp duty and registration are calculated on it.',
  },
  bu: {
    group: T,
    term: 'BU permission',
    tip: 'Building-use (completion) permission from the authority. After BU, buying from the builder has no GST on the flat price.',
  },
  gst: {
    group: T,
    term: 'GST',
    tip: '5% on under-construction homes; 1% on affordable homes (carpet ≤ 90 sq m AND price ≤ ₹45 lakh); 0% on ready homes with BU permission.',
  },
  gstAv: {
    group: T,
    term: 'GST on agreement value',
    tip: 'Goods and Services Tax on your agreement value, paid to the builder along with the price. 5% for under-construction homes, 1% for affordable homes, 0% after BU permission.',
  },
  stampDuty: {
    group: T,
    term: 'Stamp duty',
    tip: 'Tax paid to the government when you register your sale deed. 4.9% (3.5% + 40% surcharge) of the stamp value.',
    extra: 'Paid by you, not the builder. Banks usually don’t lend for it, so budget for it from your own savings.',
  },
  registration: {
    group: T,
    term: 'Registration fee',
    tip: 'Fee for recording the sale in government records: 1% of the stamp value. A woman buying alone pays nothing.',
  },
  tds: {
    group: T,
    term: 'TDS (tax deducted at source)',
    tip: 'When the price is ₹50 lakh or more, you keep back 1% from your payment to the builder and pay it to the Income Tax department (Form 26QB). It is not an extra cost, just a different way of paying part of the price.',
  },

  // ── Results ─────────────────────────────────────────────────────────────
  allIn: {
    group: P,
    term: 'All-in cost',
    tip: 'Everything you’ll pay to own the home: price + builder’s extra charges + GST + stamp duty + registration. Budget for this number, not the base price.',
  },
  blockA: {
    group: P, hidden: true,
    term: 'A · Agreement value',
    tip: 'Base price + floor rise + any charges included in the agreement. GST is charged on this block.',
  },
  blockB: {
    group: P, hidden: true,
    term: 'B · Other builder charges',
    tip: 'Charges you pay the builder outside the agreement value (development, deposits, maintenance, legal). Each has its own GST rate.',
  },
  payableToBuilder: {
    group: P,
    term: 'Payable to builder',
    tip: 'Everything that goes to the builder: agreement value + GST + other builder charges.',
  },
  governmentTotal: {
    group: T,
    term: 'Government charges',
    tip: 'Stamp duty + registration fee, paid to the government when you register the sale deed.',
  },
  effCarpet: {
    group: P,
    term: 'All-in cost per carpet sq ft',
    tip: 'Your total cost ÷ your usable (carpet) area. The best number to compare projects, because it includes every charge and ignores loading tricks.',
  },
  effSbu: {
    group: P,
    term: 'All-in cost per SBU sq ft',
    tip: 'Your total cost ÷ super built-up area. Compare it with the base rate to see how much the extra charges add per sq ft.',
  },
  overHeadline: {
    group: P,
    term: 'Over headline price',
    tip: 'How much more you pay in total than the base price. 17% means a ₹1 crore base price really costs about ₹1.17 crore.',
  },
  composition: {
    group: P, hidden: true,
    term: 'Where your money goes',
    tip: 'Your all-in cost split into the agreement value, other builder charges, GST and government charges.',
  },
  advanced: {
    group: T, hidden: true,
    term: 'Statutory rates',
    tip: 'Tax rates fixed by the government. Leave these blank unless the government has changed a rate.',
  },

  // ── Loan ────────────────────────────────────────────────────────────────
  loanValue: {
    group: L, hidden: true,
    term: 'Property value for the loan',
    tip: 'Banks lend against the agreement value, not the all-in cost. Stamp duty, registration and most separate charges usually have to come from your own savings.',
  },
  ltv: {
    group: L,
    term: 'LTV (loan-to-value)',
    tip: 'The share of the property value a bank may lend. RBI allows up to 90% for loans up to ₹30 lakh, 80% for ₹30–75 lakh, and 75% above ₹75 lakh. The rest is your down payment.',
  },
  loanMode: {
    group: L, hidden: true,
    term: 'Loan amount',
    tip: 'Max eligible: the most a bank may lend under RBI rules. % of value or Amount: choose a smaller loan yourself. Your actual eligibility also depends on your income and credit score.',
  },
  interestRate: {
    group: L, hidden: true,
    term: 'Interest rate',
    tip: 'Yearly interest rate your bank offers. Most home loans in India are “floating”, so the rate (and your EMI or tenure) can change over time.',
  },
  tenure: {
    group: L, hidden: true,
    term: 'Tenure',
    tip: 'How many years you take to repay. A longer tenure lowers your EMI but makes you pay much more interest overall.',
  },
  processingFee: {
    group: L, hidden: true,
    term: 'Processing fee',
    tip: 'One-time fee the bank charges to process your loan, as a % of the loan amount. It is often negotiable; ask your bank.',
  },
  monthlyIncome: {
    group: L, hidden: true,
    term: 'Monthly income',
    tip: 'Your take-home monthly income (optional). We’ll show what share of it the EMI takes. Banks usually prefer EMIs below about half of income.',
  },
  loanAmount: {
    group: L,
    term: 'Loan amount',
    tip: 'How much the bank lends you. The % shows how much of the property value it covers (LTV).',
  },
  emi: {
    group: L,
    term: 'EMI (equated monthly instalment)',
    tip: 'The fixed amount you pay the bank every month until the loan is repaid. Part of it repays the loan, part is interest.',
  },
  totalInterest: {
    group: L,
    term: 'Total interest',
    tip: 'Extra money you pay the bank over the whole loan, on top of what you borrowed. Prepaying early or choosing a shorter tenure cuts this a lot.',
  },
  totalRepayment: {
    group: L,
    term: 'Total repayment',
    tip: 'Loan amount + total interest: everything you will pay back to the bank.',
  },
  upfrontCash: {
    group: L,
    term: 'Upfront cash needed',
    tip: 'Money you must arrange yourself: all-in cost − loan + processing fee. This covers your down payment, stamp duty, registration and most extra charges. Start saving for this first.',
  },
  principalInterest: {
    group: L, hidden: true,
    term: 'Principal vs interest',
    tip: 'Of everything you repay, how much is the loan itself (principal) and how much is the bank’s interest.',
  },
  amortisation: {
    group: L,
    term: 'Amortisation',
    tip: 'A year-by-year view of how your EMIs split between interest and repaying the loan. In early years most of the EMI is interest.',
  },
};

export const GLOSSARY_GROUPS: GlossaryGroup[] = ['Area & units', 'Price & builder charges', 'Taxes & government', 'Loan'];

/** Glossary key for a cost-sheet line (preset rows use their preset key as id). */
export function lineTipKey(key: string, presetKey?: string): string | undefined {
  if (key === 'base') return 'basePrice';
  if (key === 'frc') return 'frc';
  if (key === 'avAdjustment') return 'avAdjustment';
  if (key === 'gstAv') return 'gstAv';
  if (key === 'stampDuty') return 'stampDuty';
  if (key === 'registration') return 'registration';
  if (presetKey && GLOSSARY[presetKey]) return presetKey;
  if (GLOSSARY[key]) return key;
  return 'custom';
}
