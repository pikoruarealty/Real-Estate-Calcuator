'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { GLOSSARY } from '@/content/glossary';

const WIDTH = 300;
const GAP = 8;

/**
 * ⓘ button that explains a term in plain language.
 * Hover (mouse), focus (keyboard) or tap (touch) to open; tap again, Esc, or tap outside to close.
 * The bubble is position:fixed and clamped to the viewport so it never runs off a phone screen.
 */
export function Tooltip({ term, text, label, className = '' }: { term?: string; text?: string; label?: string; className?: string }) {
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null);

  const entry = term ? GLOSSARY[term] : undefined;
  const body = text ?? entry?.tip;
  const title = label ?? entry?.term;

  const close = useCallback(() => {
    setOpen(false);
    setPinned(false);
  }, []);

  const place = useCallback(() => {
    const b = btn.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(WIDTH, vw - GAP * 2);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, GAP), vw - width - GAP);
    const h = bubble.current?.offsetHeight ?? 160;
    const below = r.bottom + GAP + h <= vh || r.top < h + GAP;
    setPos(below ? { left, top: r.bottom + GAP, width } : { left, bottom: vh - r.top + GAP, width });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !bubble.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onScroll = () => close();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };
  }, [open, close]);

  if (!body) return null;

  return (
    <span className={`inline-flex align-middle ${className}`}>
      <button
        ref={btn}
        type="button"
        aria-label={`What is ${title ?? 'this'}?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && !pinned && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => !pinned && setOpen(false)}
        onClick={(e) => {
          // Don't toggle a parent <details>/<label>.
          e.preventDefault();
          e.stopPropagation();
          if (pinned) close();
          else {
            setOpen(true);
            setPinned(true);
          }
        }}
        className="group/tip -my-1 ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      >
        <span
          aria-hidden
          className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[11px] font-semibold not-italic leading-none transition ${
            open ? 'border-gold bg-gold text-black' : 'border-gold-muted text-gold-muted group-hover/tip:border-gold group-hover/tip:text-gold'
          }`}
        >
          i
        </span>
      </button>
      {open && (
        <div
          ref={bubble}
          role="tooltip"
          id={id}
          style={{ position: 'fixed', left: pos?.left ?? -9999, top: pos?.top, bottom: pos?.bottom, width: pos?.width ?? WIDTH }}
          className="z-[60] rounded-xl border border-gold-muted/60 bg-surface-2 p-3.5 text-left text-[13px] font-normal normal-case leading-relaxed tracking-normal text-text shadow-2xl shadow-black/60"
          onPointerLeave={(e) => e.pointerType === 'mouse' && !pinned && setOpen(false)}
        >
          {title && <strong className="mb-1 block text-sm font-semibold text-gold">{title}</strong>}
          <span className="block">{body}</span>
          {!text && entry?.extra && <span className="mt-2 block border-t border-border pt-2 text-text-muted">{entry.extra}</span>}
        </div>
      )}
    </span>
  );
}
