'use client';

/* eslint-disable @next/next/no-img-element */
import { BRAND } from '@/config/brand';
import type { Lang } from '@/content/i18n';
import { useT } from '@/state/LanguageContext';

export type NavSection = 'calculator' | 'how' | 'glossary' | 'advisor';

function NavLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`min-h-10 whitespace-nowrap rounded-full px-3 text-sm transition ${active ? 'text-text' : 'text-text-muted hover:text-text'}`}
    >
      {children}
    </button>
  );
}

/** Quiet top bar: brand, three links, language, advisor. Panels open only on request. */
export function Header({ active, onNavigate }: { active: NavSection; onNavigate: (s: NavSection) => void }) {
  const { t, lang, setLang } = useT();
  const links = (
    <>
      <NavLink active={active === 'calculator'} onClick={() => onNavigate('calculator')}>{t('nav.calculator')}</NavLink>
      <NavLink active={active === 'how'} onClick={() => onNavigate('how')}>{t('nav.how')}</NavLink>
      <NavLink active={active === 'glossary'} onClick={() => onNavigate('glossary')}>{t('nav.glossary')}</NavLink>
    </>
  );
  return (
    <header className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => onNavigate('calculator')}
          className="flex min-h-10 shrink-0 items-center gap-2.5 rounded-full pr-2"
          aria-label={`${BRAND.name}: back to the calculator`}
        >
          <img src={BRAND.logoPath} alt="" width={28} height={28} className="h-7 w-7 rounded-lg" />
          <span className="hidden text-[15px] font-semibold tracking-tight text-text min-[480px]:inline">{BRAND.name}</span>
        </button>

        <nav aria-label={t('nav.menu')} className="ml-4 hidden items-center md:flex">{links}</nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">{t('nav.language')}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="h-10 appearance-none rounded-full bg-transparent pl-3 pr-7 text-sm text-text-muted ring-1 ring-white/10 transition hover:text-text focus-visible:text-text"
            >
              <option value="en">English</option>
              <option value="gu">ગુજરાતી</option>
            </select>
            <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          <button
            type="button"
            onClick={() => onNavigate('advisor')}
            className="min-h-10 whitespace-nowrap rounded-full bg-gold px-4 text-sm font-semibold text-black transition hover:brightness-110"
          >
            {t('nav.advisor')}
          </button>
        </div>
      </div>
      {/* Phones: links drop to their own row instead of being squeezed. */}
      <nav aria-label={t('nav.menu')} className="-mx-1 mt-1 flex items-center md:hidden">{links}</nav>
    </header>
  );
}
