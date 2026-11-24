import Link from 'next/link';
import { BRAND } from '@/config/brand';
import { RATES_UPDATED_ON } from '@/engine/config';
import { Disclaimer } from './Disclaimer';

export function Footer() {
  return (
    <footer className="mx-auto mt-20 max-w-6xl px-4 pb-28 sm:px-6 md:pb-12">
      <div className="border-t border-white/5 pt-6">
        <Disclaimer className="max-w-3xl" />
        <p className="mt-4 text-xs text-text-muted">
          © {BRAND.name} · <Link href="/terms" className="underline decoration-white/20 underline-offset-4 hover:text-text">Terms &amp; privacy</Link> · Rates updated {RATES_UPDATED_ON}
        </p>
      </div>
    </footer>
  );
}
