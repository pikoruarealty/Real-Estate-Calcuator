# Ahmedabad Real Estate Calculator

Free, mobile-first calculator that turns an Ahmedabad property quote into true areas, an all-in cost sheet
(GST, stamp duty, registration, TDS info) and a loan/EMI view. Built from `real-estate-calculator-SPEC.md`.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · Vitest · Playwright · zod · lz-string ·
`@react-pdf/renderer` · `html-to-image`.

## Setup
```bash
npm install
cp .env.example .env.local   # fill in what you need
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: engine, all spec §12 fixtures (T1–T12) |
| `npm run test:e2e` | Playwright smoke tests (builds and serves on :3100; run `npx playwright install chromium` once) |

## Environment variables
| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, OG, sitemap |
| `NEXT_PUBLIC_ADVISOR_WHATSAPP` | Digits with country code. Defaults to `916354359222`; set to empty to hide the WhatsApp follow-up button |
| `LEAD_WEBHOOK_URL` | Receives advisor leads as JSON (`POST`, 5 s timeout). Unset → leads are `console.info`'d |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Enables Plausible analytics when set |

Brand name / tagline / logo live in `src/config/brand.ts` (replace the placeholder `public/logo.svg`).

## Architecture
- `src/engine/**` is pure TypeScript (no React/DOM/I/O). **All statutory numbers live only in `src/engine/config.ts`.**
- `src/state/useCalculator.ts` holds one `CalculatorInput`, derives the result via `calculate()`, and syncs
  the URL (`?s=` lz-string, zod-validated, debounced 500 ms).
- Money: each displayed line is rounded to the rupee; subtotals and totals are sums of rounded lines.
- Lead API: `POST /api/lead` (zod, honeypot `company`, in-memory 5 req / 10 min / IP, webhook forward).
  The in-memory limiter is per server instance. Use a shared store if you scale out.

## Before launch (open items)
- Replace the placeholder logo; have counsel review `/terms`.
- Confirm commercial-property GST (`GST.commercialDefaultPct`, currently 12%, flagged `TODO(spec)` in config).
- Re-check statutory rates and bump `RATES_UPDATED_ON` in `src/engine/config.ts`.
- Run Lighthouse (mobile) against the production build; target ≥ 90 for Performance and Accessibility.
- PDF uses Inter TTFs in `public/fonts` (needed for the ₹ glyph). Inter is OFL-licensed.
