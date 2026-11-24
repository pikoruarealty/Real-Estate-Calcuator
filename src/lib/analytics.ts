export type AnalyticsEvent =
  | 'calc_complete' | 'export_pdf' | 'export_png' | 'share_whatsapp'
  | 'copy_link' | 'advisor_open' | 'lead_submit';

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string | number> }) => void;
  }
}

/** No-op unless the Plausible script is loaded (NEXT_PUBLIC_PLAUSIBLE_DOMAIN set). */
export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  window.plausible?.(event, props ? { props } : undefined);
}
