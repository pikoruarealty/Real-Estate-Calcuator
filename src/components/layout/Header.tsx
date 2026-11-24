/* eslint-disable @next/next/no-img-element */
import { BRAND } from '@/config/brand';

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <img src={BRAND.logoPath} alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
        <div>
          <p className="font-display text-2xl leading-none text-gold">{BRAND.name}</p>
          <h1 className="mt-1 text-xs text-text-muted sm:text-sm">{BRAND.tagline}</h1>
        </div>
      </div>
    </header>
  );
}
