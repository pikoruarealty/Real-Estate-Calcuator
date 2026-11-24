/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BRAND } from '@/config/brand';
import { RATES_UPDATED_ON } from '@/engine/config';
import { longDate } from '@/lib/dates';
import { BookIcon, CalculatorIcon, ChatIcon } from '@/components/ui/Icons';
import { Disclaimer } from './Disclaimer';
import type { NavSection } from './Header';

function Col({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      {children}
    </div>
  );
}

const linkCls = 'flex min-h-9 items-center gap-2.5 text-sm text-text/90 transition hover:text-gold';

/** Display a 91XXXXXXXXXX number as +91 XXXXX XXXXX. */
function prettyPhone(n: string) {
  const d = n.replace(/\D/g, '');
  return d.length === 12 && d.startsWith('91') ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`;
}

export function Footer({ onNavigate }: { onNavigate?: (s: NavSection) => void }) {
  const wa = BRAND.advisorWhatsApp;
  return (
    <footer className="mt-24 border-t border-white/5 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-12 sm:px-6 md:pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={BRAND.logoPath} alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-semibold tracking-tight">{BRAND.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              A free calculator for Ahmedabad home buyers. See the true size, the real all-in price and your EMI, before you sign anything.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1 text-xs text-text-muted">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
              Gujarat rates updated {longDate(RATES_UPDATED_ON)}
            </p>
          </div>

          {onNavigate && (
            <Col title="Explore">
              <ul>
                <li><button type="button" onClick={() => onNavigate('calculator')} className={linkCls}><CalculatorIcon className="text-text-muted" />Calculator</button></li>
                <li><button type="button" onClick={() => onNavigate('glossary')} className={linkCls}><BookIcon className="text-text-muted" />Glossary</button></li>
                <li><button type="button" onClick={() => onNavigate('advisor')} className={linkCls}><ChatIcon className="text-text-muted" />Talk to an advisor</button></li>
                <li><Link href="/terms" className={`${linkCls} pl-[26px]`}>Terms &amp; privacy</Link></li>
              </ul>
            </Col>
          )}

          <Col title="Need help deciding?">
            <p className="text-sm leading-relaxed text-text-muted">Our advisors check builder quotes, charges and loan offers. Free, no obligation.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {wa && (
                <a
                  href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi, I need help with a property I’m considering.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  <ChatIcon />
                  WhatsApp us
                </a>
              )}
              {onNavigate && (
                <button type="button" onClick={() => onNavigate('advisor')} className="inline-flex min-h-11 items-center rounded-full bg-white/[0.06] px-5 text-sm text-text transition hover:bg-white/10">
                  Request a call
                </button>
              )}
            </div>
            {wa && <p className="mt-3 text-[13px] tabular-nums text-text-muted">{prettyPhone(wa)}</p>}
          </Col>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6">
          <Disclaimer />
          <div className="mt-6 flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {BRAND.name}. All figures are estimates.</p>
            <p>Made for home buyers in Ahmedabad</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
