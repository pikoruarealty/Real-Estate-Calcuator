'use client';

import { useRef, useState } from 'react';
import { whatsappSummary } from '@/content/copy';
import { track } from '@/lib/analytics';
import { useApp } from '@/state/CalculatorContext';
import { Button } from '@/components/ui/Button';
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

export function ShareMenu() {
  const { input, result, shareUrl } = useApp();
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
      const t = document.createElement('textarea');
      t.value = shareUrl;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    track('copy_link');
    say('Link copied');
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
      say('PDF downloaded');
    } catch (e) {
      console.error(e);
      say('Could not create the PDF. Please try again.');
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
      say('Image saved');
    } catch (e) {
      console.error(e);
      say('Could not create the image. Please try again.');
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
      <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        <Button variant="secondary" className="min-h-10 px-2 text-[13px] sm:px-4" onClick={whatsapp} disabled={disabled}>WhatsApp</Button>
        <Button variant="secondary" className="min-h-10 px-2 text-[13px] sm:px-4" onClick={copyLink} disabled={!shareUrl}>Copy link</Button>
        <Button variant="secondary" className="min-h-10 px-2 text-[13px] sm:px-4" aria-label="Download PDF" onClick={pdf} disabled={disabled || busy !== null}>{busy === 'pdf' ? 'Preparing…' : 'PDF'}</Button>
        <Button variant="secondary" className="min-h-10 px-2 text-[13px] sm:px-4" aria-label="Save image" onClick={png} disabled={disabled || busy !== null}>{busy === 'png' ? 'Preparing…' : 'Image'}</Button>
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
