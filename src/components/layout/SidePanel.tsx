'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from '@/components/ui/Icons';
import { useT } from '@/state/LanguageContext';

/**
 * Right-hand drawer built on the native <dialog>: focus trap, Esc and backdrop-click to close.
 * It stays mounted, so whatever is inside (e.g. a search box) and the page behind it keep their state.
 */
export function SidePanel({ open, onClose, title, subtitle, children, titleId }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; titleId: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useT();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-0 ml-auto h-dvh max-h-none w-[min(28rem,100vw)] max-w-none bg-surface p-0 text-text shadow-2xl ring-1 ring-white/10 backdrop:bg-black/60"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
          <div>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
          </div>
          <button type="button" aria-label={`${t('panel.close')}: ${title}`} onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-white/5 hover:text-text">
            <CloseIcon size={16} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
