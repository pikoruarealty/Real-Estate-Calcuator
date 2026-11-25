'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BRAND } from '@/config/brand';
import { RATES_UPDATED_ON } from '@/engine/config';
import { longDate } from '@/lib/dates';
import { useT } from '@/state/LanguageContext';
import { Disclaimer } from './Disclaimer';
import type { NavSection } from './Header';

const linkCls =
  'group inline-flex min-h-9 items-center gap-2 text-sm text-text-muted transition hover:text-gold';

/** Display a 91XXXXXXXXXX number as +91 XXXXX XXXXX. */
function prettyPhone(n: string) {
  const d = n.replace(/\D/g, '');
  return d.length === 12 && d.startsWith('91') ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`;
}

/* ---------- Icons (lucide-style, inline) ---------- */
function Icon({ children, className = 'h-4 w-4' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const CalculatorIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
  </Icon>
);
const LayersIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </Icon>
);
const BookIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Icon>
);
const ShieldIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Icon>
);
const InfoIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Icon>
);
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </Icon>
);
const PhoneIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icon>
);

const navIconCls = 'h-4 w-4 text-gold/80 transition group-hover:text-gold';

export function Footer({ onNavigate }: { onNavigate?: (s: NavSection) => void }) {
  const { t } = useT();
  const wa = BRAND.advisorWhatsApp;
  return (
    <footer className="mt-12 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-6">
        {/* Main row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          {/* Brand */}
          <div className="lg:max-w-[18rem] lg:shrink">
            <div className="flex items-center gap-2.5">
              <img src={BRAND.logoPath} alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
              <span className="text-base font-semibold tracking-tight">{BRAND.name}</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{t('footer.about')}</p>
          </div>

          {/* Nav */}
          {onNavigate && (
            <nav aria-label="Footer" className="lg:shrink-0 lg:border-x lg:border-white/10 lg:px-8 lg:py-1">
              <ul className="flex flex-wrap gap-x-6 gap-y-0 lg:grid lg:grid-cols-2">
                <li>
                  <button type="button" onClick={() => onNavigate('calculator')} className={linkCls}>
                    <CalculatorIcon className={navIconCls} />
                    {t('nav.calculator')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('how')} className={linkCls}>
                    <LayersIcon className={navIconCls} />
                    {t('nav.how')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('glossary')} className={linkCls}>
                    <BookIcon className={navIconCls} />
                    {t('nav.glossary')}
                  </button>
                </li>
                <li>
                  <Link href="/terms" className={linkCls}>
                    <ShieldIcon className={navIconCls} />
                    {t('footer.terms')}
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          {/* Help */}
          <div className="lg:ml-auto lg:max-w-sm lg:shrink-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="text-sm font-semibold">{t('footer.help')}</h2>
              {wa && <span className="text-[13px] tabular-nums text-text-muted">{prettyPhone(wa)}</span>}
            </div>
            <p className="mt-0.5 text-[13px] leading-relaxed text-text-muted">{t('footer.helpText')}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {wa && (
                <a
                  href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi, I need help with a property I’m considering.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-gold px-4 text-[13px] font-semibold text-black transition hover:brightness-110"
                >
                  <WhatsAppIcon />
                  {t('footer.whatsapp')}
                </a>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('advisor')}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[13px] text-text ring-1 ring-white/15 transition hover:ring-gold/60"
                >
                  <PhoneIcon />
                  {t('footer.call')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-5 flex flex-col gap-3 border-t border-white/5 pt-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-start gap-2">
            <InfoIcon className="mt-0.5 h-4 w-4 text-text-muted" />
            <Disclaimer className="!text-[11px]" />
          </div>
          <p className="text-xs text-text-muted md:shrink-0 md:border-l md:border-white/10 md:pl-6">
            © {BRAND.name}. {t('footer.copy')} · {t('footer.rates')} {longDate(RATES_UPDATED_ON)}
          </p>
        </div>
      </div>
    </footer>
  );
}