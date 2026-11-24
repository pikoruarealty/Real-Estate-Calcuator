import type { ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export function Card({
  title, children, className = '', right, tip, subtitle,
}: { title?: ReactNode; children: ReactNode; className?: string; right?: ReactNode; tip?: string; subtitle?: ReactNode }) {
  return (
    <section className={`rounded-3xl bg-surface p-5 sm:p-6 ${className}`}>
      {(title || right) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="flex items-center text-[17px] font-semibold tracking-tight text-text">
                {title}
                {tip && <Tooltip term={tip} />}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-sm leading-relaxed text-text-muted">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/** Collapsible section with a soft chevron. */
export function Disclosure({
  summary, hint, children, defaultOpen = false, className = '', tip,
}: { summary: ReactNode; hint?: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string; tip?: string }) {
  return (
    <details open={defaultOpen} className={`group rounded-3xl bg-surface ${className}`}>
      <summary className="flex min-h-16 items-center gap-3 px-5 py-4 sm:px-6">
        <span className="min-w-0 flex-1">
          <span className="flex items-center text-[15px] font-semibold text-text">{summary}{tip && <Tooltip term={tip} />}</span>
          {hint && <span className="mt-0.5 block text-[13px] text-text-muted">{hint}</span>}
        </span>
        <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted transition group-open:rotate-180">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </summary>
      <div className="px-5 pb-6 sm:px-6">{children}</div>
    </details>
  );
}
