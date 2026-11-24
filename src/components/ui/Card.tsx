import type { ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export function Card({
  title, children, className = '', right, tip, subtitle,
}: { title?: ReactNode; children: ReactNode; className?: string; right?: ReactNode; tip?: string; subtitle?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {title && (
              <h2 className="flex items-center font-display text-lg text-text">
                {title}
                {tip && <Tooltip term={tip} />}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-[13px] leading-relaxed text-text-muted">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
