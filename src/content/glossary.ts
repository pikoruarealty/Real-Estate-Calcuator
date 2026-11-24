export interface GlossaryEntry {
  term: string;
  tip: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  carpet: { term: 'Carpet area (RERA)', tip: 'Usable floor area including internal walls. Excludes external walls, shafts, balcony and terrace.' },
  reraArea: { term: 'RERA area', tip: 'Carpet + balcony + wash + terrace, as shown on many Ahmedabad brochures.' },
  sbu: { term: 'Super built-up (SBU)', tip: 'Carpet plus your share of lobbies, stairs, lifts and amenities. Most quotes are priced on it.' },
  loading: { term: 'Loading', tip: 'Common area as a % of carpet. SBU = carpet × (1 + loading).' },
  kapat: { term: 'Kapat (કપાત)', tip: 'Deduction: common area as a % of SBU. Carpet = SBU × (1 − kapat). In land, also the ~40% TP-scheme cut.' },
  plc: { term: 'PLC', tip: 'Preferential location charge for garden, corner, road or view-facing units.' },
  frc: { term: 'FRC', tip: 'Floor rise charge: ₹ per sq ft for each floor above a base floor.' },
  av: { term: 'Agreement value', tip: 'Price written in the sale agreement. GST and stamp duty are charged on it.' },
  jantri: { term: 'Jantri', tip: "Gujarat government's minimum property rate. Stamp duty is on the higher of agreement value and Jantri value." },
  sv: { term: 'Stamp value', tip: 'The higher of agreement value and Jantri value.' },
  bu: { term: 'BU permission', tip: 'Building-use (completion) permission. After it, buying from the builder has no GST.' },
  maintDeposit: { term: 'Maintenance deposit / corpus', tip: 'One-time fund later handed to the society.' },
  advanceMaint: { term: 'Advance maintenance', tip: 'Running maintenance collected upfront, usually for 12–24 months.' },
  gst: { term: 'GST', tip: '5% on under-construction homes, 1% on affordable homes (carpet ≤ 90 sq m and price ≤ ₹45 L), 0% after BU.' },
  stampDuty: { term: 'Stamp duty', tip: '4.9% in Gujarat (3.5% + 40% surcharge).' },
  registration: { term: 'Registration fee', tip: '1% in Gujarat; waived for a sole woman buyer.' },
  tds: { term: 'TDS', tip: '1% the buyer deducts and pays to the government when price is ₹50 L or more. Not an extra cost.' },
  ltv: { term: 'LTV', tip: 'Loan-to-value: RBI lets banks lend up to 90% (≤ ₹30 L), 80% (₹30–75 L) or 75% (> ₹75 L).' },
  vaar: { term: 'Vaar / gaj', tip: 'Square yard = 9 sq ft.' },
  guntha: { term: 'Guntha', tip: '1,089 sq ft; 40 guntha = 1 acre.' },
  vigha: { term: 'Vigha / bigha', tip: 'Land unit; 17,424 sq ft in Ahmedabad, but varies by region.' },
};
