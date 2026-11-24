'use client';

import { useRef, useState } from 'react';
import { whatsappSummary } from '@/content/copy';
import { track } from '@/lib/analytics';
import { useApp } from '@/state/CalculatorContext';
import { useT } from '@/state/LanguageContext';
import { ShareImageCard } from './ShareImageCard';

function fileDate() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'property';

function download(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const BIG =
  'group relative flex min-h-14 flex-1 basis-56 items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 text-base font-bold text-black shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-lg';
const SMALL =
  'min-h-10 rounded-full px-4 text-[13px] text-text-muted ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:text-text hover:ring-gold/50 disabled:opacity-40 disabled:hover:translate-y-0';

/** Light sweep across the button on hover. */
function Shine() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100 group-disabled:hidden"
    />
  );
}

export function ShareMenu() {
  const { input, result, shareUrl } = useApp();
  const { t } = useT();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null);
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const disabled = !result.cost;

  const say = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    track('copy_link');
    say(t('share.copied'));
  }

  async function pdf() {
    setBusy('pdf');
    try {
      const { pdf: makePdf } = await import('@react-pdf/renderer');
      const { CostSheetPdf } = await import('./CostSheetPdf');
      const date = fileDate();
      const blob = await makePdf(
        <CostSheetPdf input={input} result={result} shareUrl={shareUrl} origin={window.location.origin} date={date} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      download(url, `cost-sheet-${slug(input.cost.projectName)}-${date}.pdf`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      track('export_pdf');
      say(t('share.pdfDone'));
    } catch (e) {
      console.error(e);
      say(t('share.pdfFail'));
    } finally {
      setBusy(null);
    }
  }

  async function png() {
    setBusy('png');
    setShowCard(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (document.fonts?.ready) await document.fonts.ready;
      const node = cardRef.current;
      if (!node) throw new Error('card not mounted');
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true });
      download(dataUrl, `cost-summary-${slug(input.cost.projectName)}-${fileDate()}.png`);
      track('export_png');
      say(t('share.imgDone'));
    } catch (e) {
      console.error(e);
      say(t('share.imgFail'));
    } finally {
      setShowCard(false);
      setBusy(null);
    }
  }

  function whatsapp() {
    const text = whatsappSummary({ projectName: input.cost.projectName, result, loan: input.loan, shareUrl });
    track('share_whatsapp');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      <p className="text-sm font-semibold">{t('share.title')}</p>
      <p className="mb-3 text-[13px] text-text-muted">{t('share.sub')}</p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={pdf}
          disabled={disabled || busy !== null}
          aria-label={t('share.pdf')}
          className={`${BIG} bg-gold shadow-gold/20 hover:shadow-gold/30`}
        >
          <Shine />
          <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-bounce">
            <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 20h16" />
          </svg>
          {busy === 'pdf' ? t('share.prep') : t('share.pdf')}
        </button>

        <button
          type="button"
          onClick={whatsapp}
          disabled={disabled}
          className={`${BIG} bg-[#25D366] shadow-[#25D366]/20 hover:shadow-[#25D366]/30`}
        >
          <Shine />
          <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-125">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
          {t('share.whatsapp')}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copyLink} disabled={!shareUrl} className={SMALL}>{t('share.copy')}</button>
        <button type="button" onClick={png} disabled={disabled || busy !== null} aria-label={t('share.image')} className={SMALL}>
          {busy === 'png' ? t('share.prep') : t('share.image')}
        </button>
      </div>

      <p role="status" aria-live="polite" className="mt-2 min-h-4 text-[13px] text-gold">{msg}</p>
      {showCard && (
        <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}>
          <ShareImageCard ref={cardRef} input={input} result={result} />
        </div>
      )}
    </div>
  );
}
