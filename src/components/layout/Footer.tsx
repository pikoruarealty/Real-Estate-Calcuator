import Link from 'next/link';
import { RATES_UPDATED_ON } from '@/engine/config';
import { Disclaimer } from './Disclaimer';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-6 pb-28 md:pb-8">
        <Disclaimer />
        <p className="text-xs text-text-muted">
          <Link href="/terms" className="text-gold-muted underline hover:text-gold">Terms &amp; privacy</Link>
          <span aria-hidden> · </span>
          Rates updated on {RATES_UPDATED_ON}
        </p>
      </div>
    </footer>
  );
}
