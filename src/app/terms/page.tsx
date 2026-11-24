import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/config/brand';
import { DISCLAIMER } from '@/content/copy';
import { RATES_UPDATED_ON } from '@/engine/config';

export const metadata: Metadata = { title: 'Terms & privacy', description: `Terms of use and privacy notice for the ${BRAND.name} calculator.` };

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 leading-relaxed">
      <Link href="/" className="text-sm text-gold-muted underline hover:text-gold">← Back to calculator</Link>
      <h1 className="mt-4 font-display text-4xl text-gold">Terms &amp; privacy</h1>
      <p className="mt-1 text-sm text-text-muted">Last updated {RATES_UPDATED_ON}. {/* TODO(owner): have counsel review before launch */}</p>

      <h2 className="mt-8 font-display text-2xl">Terms of use</h2>
      <p className="mt-2 text-text-muted">{DISCLAIMER}</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-text-muted">
        <li>The calculator is free and does not need an account.</li>
        <li>Results are estimates only. They are not an offer, quotation, valuation or advice from {BRAND.name} or any developer or lender.</li>
        <li>You are responsible for confirming every figure with the developer, your lender and a qualified legal or tax professional.</li>
        <li>We may change the calculator, its rates and these terms at any time.</li>
      </ul>

      <h2 className="mt-8 font-display text-2xl">Privacy</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-text-muted">
        <li><strong className="text-text">Your calculation stays with you.</strong> The numbers you enter are computed in your browser. They are stored only in the share link in your address bar, which you can copy or discard.</li>
        <li><strong className="text-text">Advisor requests.</strong> If you ask our advisor to call you, we receive your name, mobile number, optional email and message, and (if you choose) your calculation. We use them only to respond to your enquiry.</li>
        <li><strong className="text-text">Analytics.</strong> If enabled, we use privacy-friendly Plausible analytics to count visits and button clicks. No cookies, no personal data.</li>
      </ul>
      <p className="mt-6 text-sm text-text-muted">Questions? Use “Talk to our expert advisor” on the calculator.</p>
    </main>
  );
}
