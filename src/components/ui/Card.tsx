import type { ReactNode } from 'react';

export function Card({ title, children, className = '', right }: { title?: ReactNode; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="font-display text-xl text-text">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
