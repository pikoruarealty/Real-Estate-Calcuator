'use client';

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from 'react';
import { BRAND } from '@/config/brand';
import { BookIcon, CalculatorIcon, ChatIcon } from '@/components/ui/Icons';

export type NavSection = 'calculator' | 'glossary' | 'advisor';

const Icon = {
  calculator: <CalculatorIcon />,
  glossary: <BookIcon />,
  advisor: <ChatIcon />,
};

function NavItem({ active, onClick, icon, label, short, accent }: {
  active: boolean; onClick: () => void; icon: ReactNode; label: string; short: string; accent?: boolean;
}) {
  const base = 'flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 max-[399px]:px-2.5 text-[13px] font-medium transition sm:gap-2 sm:px-4 sm:text-sm';
  const tone = accent
    ? active
      ? 'bg-gold text-black'
      : 'bg-gold/15 text-gold hover:bg-gold hover:text-black'
    : active
      ? 'bg-white/10 text-text'
      : 'text-text-muted hover:text-text';
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`${base} ${tone}`}>
      <span className="flex max-[399px]:hidden">{icon}</span>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Top navigation: Calculator · Glossary · Advisor contact. */
export function Header({ active, onNavigate }: { active: NavSection; onNavigate: (s: NavSection) => void }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
      <button
        type="button"
        onClick={() => onNavigate('calculator')}
        className="flex min-h-10 shrink-0 items-center gap-2.5 rounded-full pr-2"
        aria-label={`${BRAND.name}: back to the calculator`}
      >
        <img src={BRAND.logoPath} alt="" width={28} height={28} className="h-7 w-7 rounded-lg" />
        <span className="hidden text-[15px] font-semibold tracking-tight text-text min-[480px]:inline">{BRAND.name}</span>
      </button>
      <nav aria-label="Main" className="ml-auto">
        <ul className="flex items-center gap-1 rounded-full bg-surface p-1">
          <li><NavItem active={active === 'calculator'} onClick={() => onNavigate('calculator')} icon={Icon.calculator} label="Calculator" short="Calculator" /></li>
          <li><NavItem active={active === 'glossary'} onClick={() => onNavigate('glossary')} icon={Icon.glossary} label="Glossary" short="Glossary" /></li>
          <li><NavItem active={active === 'advisor'} onClick={() => onNavigate('advisor')} icon={Icon.advisor} label="Talk to an advisor" short="Advisor" accent /></li>
        </ul>
      </nav>
    </header>
  );
}
