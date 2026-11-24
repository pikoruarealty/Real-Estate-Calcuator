/* eslint-disable @next/next/no-img-element */
import { BRAND } from '@/config/brand';

export function Header({ onGlossary }: { onGlossary?: () => void }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <img src={BRAND.logoPath} alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl leading-none text-gold sm:text-2xl">{BRAND.name}</p>
          <h1 className="mt-1 text-xs text-text-muted sm:text-sm">{BRAND.tagline}</h1>
        </div>
        {onGlossary && (
          <button
            type="button"
            onClick={onGlossary}
            className="flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm text-text hover:border-gold-muted hover:text-gold"
          >
            <span aria-hidden>📖</span>
            <span>Glossary</span>
          </button>
        )}
      </div>
    </header>
  );
}
