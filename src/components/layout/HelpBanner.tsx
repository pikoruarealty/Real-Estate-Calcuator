'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/state/LanguageContext';

const KEY = 'pikorua.glossaryBannerDismissed';

/** Remembers dismissal across visits. Hidden until storage has been read, so a returning user never sees a flash. */
export function useHelpBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== '1'); } catch { setShow(true); }
  }, []);
  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(KEY, '1'); } catch {}
  };
  return { show, dismiss };
}

export function HelpBanner({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  const { t } = useT();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-white/[0.04] py-2 pl-4 pr-2 text-[13px] text-text-muted">
      <p className="min-w-0 flex-1 basis-60">{t('banner.text')}</p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onOpen} className="min-h-9 rounded-full px-3 font-medium text-gold hover:underline">{t('banner.open')}</button>
        <button type="button" onClick={onDismiss} className="min-h-9 rounded-full px-3 hover:text-text">{t('banner.dismiss')}</button>
      </div>
    </div>
  );
}
