'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
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
      className={`group relative min-h-10 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-all duration-300 motion-reduce:transition-none ${
        active ? 'bg-white/[0.06] text-text' : 'text-text-muted hover:bg-white/[0.04] hover:text-text'
      }`}
    >
      <span className="relative inline-block transition-transform duration-300 group-hover:-translate-y-px motion-reduce:transform-none">
        {children}
      </span>
      {/* Gold underline: grows from the centre on hover, stays on when active */}
      <span
        aria-hidden
        className={`absolute inset-x-3.5 bottom-1 h-0.5 origin-center rounded-full bg-gold transition-transform duration-300 motion-reduce:transition-none ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </button>
  );
}

/** Sticky glass top bar: brand, links, language, advisor. Panels open only on request. */
export function Header({ active, onNavigate }: { active: NavSection; onNavigate: (s: NavSection) => void }) {
  const { t, lang, setLang } = useT();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const links = (
    <>
      <NavLink active={active === 'calculator'} onClick={() => onNavigate('calculator')}>{t('nav.calculator')}</NavLink>
      <NavLink active={active === 'how'} onClick={() => onNavigate('how')}>{t('nav.how')}</NavLink>
      <NavLink active={active === 'glossary'} onClick={() => onNavigate('glossary')}>{t('nav.glossary')}</NavLink>
    </>
  );

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-500 motion-reduce:transition-none ${
        mounted ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      } ${
        scrolled
          ? 'border-white/10 bg-black/60 shadow-lg shadow-black/30 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className={`mx-auto max-w-6xl px-4 transition-all duration-300 sm:px-6 ${scrolled ? 'py-1.5' : 'py-3'}`}>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onNavigate('calculator')}
            className="group flex min-h-10 shrink-0 items-center gap-2.5 rounded-full pr-2"
            aria-label={`${BRAND.name}: back to the calculator`}
          >
            <span className="relative">
              <span
                aria-hidden
                className="absolute inset-0 rounded-lg bg-gold/50 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              />
              <img
                src={BRAND.logoPath}
                alt=""
                width={28}
                height={28}
                className="relative h-7 w-7 rounded-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transform-none"
              />
            </span>
            <span className="hidden text-[15px] font-semibold tracking-tight text-text transition-colors duration-300 group-hover:text-gold min-[480px]:inline">
              {BRAND.name}
            </span>
          </button>

          <nav aria-label={t('nav.menu')} className="ml-4 hidden items-center gap-1 md:flex">{links}</nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Language */}
            <label className="group relative">
              <span className="sr-only">{t('nav.language')}</span>
              <svg
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-300 group-hover:text-gold"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="h-10 cursor-pointer appearance-none rounded-full bg-transparent pl-9 pr-7 text-sm text-text-muted ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.04] hover:text-text hover:ring-gold/50 focus-visible:text-text focus-visible:outline-none focus-visible:ring-gold/60"
              >
                <option value="en">English</option>
                <option value="gu">ગુજરાતી</option>
              </select>
              <svg
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-transform duration-300 group-hover:translate-y-[-30%]"
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>

            {/* Advisor CTA */}
            <button
              type="button"
              onClick={() => onNavigate('advisor')}
              className="group relative inline-flex min-h-10 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-gold px-4 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30 active:translate-y-0 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {/* Shimmer sweep */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-[200%] motion-reduce:hidden"
              />
              {/* Live dot */}
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-700 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-700" />
              </span>
              <span className="relative">{t('nav.advisor')}</span>
              <svg
                aria-hidden
                className="relative -ml-0.5 hidden transition-transform duration-300 group-hover:translate-x-1 sm:block"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Phones: links drop to their own row instead of being squeezed. */}
        <nav aria-label={t('nav.menu')} className="-mx-1 mt-1 flex items-center gap-1 md:hidden">{links}</nav>
      </div>

      {/* Scroll progress line */}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-gold/40 via-gold to-gold/40 transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}