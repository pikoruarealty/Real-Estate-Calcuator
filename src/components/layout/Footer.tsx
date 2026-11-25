'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { BRAND } from '@/config/brand';
import { RATES_UPDATED_ON } from '@/engine/config';
import { longDate } from '@/lib/dates';
import { useT } from '@/state/LanguageContext';
import { Disclaimer } from './Disclaimer';
import type { NavSection } from './Header';

const linkCls = 'min-h-9 text-sm text-text-muted transition hover:text-gold';

/** Display a 91XXXXXXXXXX number as +91 XXXXX XXXXX. */
function prettyPhone(n: string) {
  const d = n.replace(/\D/g, '');
  return d.length === 12 && d.startsWith('91') ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`;
}

export function Footer({ onNavigate }: { onNavigate?: (s: NavSection) => void }) {
  const { t } = useT();
  const wa = BRAND.advisorWhatsApp;
  return (
    <footer className="mt-16 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 md:pb-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={BRAND.logoPath} alt="" width={24} height={24} className="h-6 w-6 rounded-md" />
              <span className="text-[15px] font-semibold tracking-tight">{BRAND.name}</span>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-text-muted">{t('footer.about')}</p>
          </div>

          {onNavigate && (
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 md:flex-col md:gap-y-0">
                <li><button type="button" onClick={() => onNavigate('calculator')} className={linkCls}>{t('nav.calculator')}</button></li>
                <li><button type="button" onClick={() => onNavigate('how')} className={linkCls}>{t('nav.how')}</button></li>
                <li><button type="button" onClick={() => onNavigate('glossary')} className={linkCls}>{t('nav.glossary')}</button></li>
                <li><Link href="/terms" className={`inline-flex items-center ${linkCls}`}>{t('footer.terms')}</Link></li>
              </ul>
            </nav>
          )}

          <div>
            <h2 className="text-sm font-semibold">{t('footer.help')}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-text-muted">{t('footer.helpText')}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {wa && (
                <a
                  href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi, I need help with a property I’m considering.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full bg-gold px-4 text-[13px] font-semibold text-black transition hover:brightness-110"
                >
                  {t('footer.whatsapp')}
                </a>
              )}
              {onNavigate && (
                <button type="button" onClick={() => onNavigate('advisor')} className="inline-flex min-h-10 items-center rounded-full px-4 text-[13px] text-text ring-1 ring-white/15 transition hover:ring-gold/60">
                  {t('footer.call')}
                </button>
              )}
              {wa && <span className="text-[13px] tabular-nums text-text-muted">{prettyPhone(wa)}</span>}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-5">
          <Disclaimer className="!text-[11px]" />
          <p className="mt-4 text-xs text-text-muted">
            © {BRAND.name}. {t('footer.copy')} · {t('footer.rates')} {longDate(RATES_UPDATED_ON)}
          </p>
        </div>
      </div>
    </footer>
  );
}
