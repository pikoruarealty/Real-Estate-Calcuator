/**
 * One small line-icon set (1.5px strokes, currentColor), matching the logo.
 * Use these instead of emoji so icons look the same on every phone.
 */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: P) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  );
}

/** House: same shape as the logo. */
export const HomeIcon = (p: P) => (
  <Svg {...p}><path d="M3.5 11 12 3.5l8.5 7.5v9a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5v-9Z" /></Svg>
);

/** Floor plan with a measuring corner: area. */
export const AreaIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M3.5 12h7v8.5M10.5 12V3.5" />
    <path d="M14 17h3.5M17.5 13.5V17" />
  </Svg>
);

/** Ruler: measurements / per sq ft. */
export const RulerIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
    <path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4" />
  </Svg>
);

/** Receipt: cost sheet. */
export const ReceiptIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5.5 3.5h13v17l-2.2-1.4-2.1 1.4-2.2-1.4-2.2 1.4-2.1-1.4-2.2 1.4v-17Z" />
    <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
  </Svg>
);

/** Price tag: the quoted price. */
export const TagIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1a1 1 0 0 1 .7.3l7.2 7.2a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0L3.8 13.3a1 1 0 0 1-.3-.7Z" />
    <circle cx="8.5" cy="8.5" r="1.4" />
  </Svg>
);

/** Columned building: government / bank. */
export const GovIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 9.5 12 4l9 5.5M4.5 20h15M3.5 20.5h17" />
    <path d="M6.5 10.5V17M10 10.5V17M14 10.5V17M17.5 10.5V17" />
  </Svg>
);

/** Bank: loan. */
export const BankIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 9.5 12 4l9 5.5H3Z" />
    <path d="M5.5 12v5.5M9.8 12v5.5M14.2 12v5.5M18.5 12v5.5M3.5 20.5h17" />
  </Svg>
);

/** Wallet: cash you need. */
export const WalletIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7.5V18a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-9a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 1 4 6v0a1.5 1.5 0 0 1 1.5-1.5H17" />
    <path d="M16 13.5h1.5" />
  </Svg>
);

export const CalculatorIcon = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="2.75" width="14" height="18.5" rx="2.5" />
    <path d="M8.5 7h7" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" strokeWidth={2.4} />
  </Svg>
);

export const BookIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h4.5A2.5 2.5 0 0 1 12 6v14a2 2 0 0 0-2-2H5a1.5 1.5 0 0 1-1.5-1.5V5ZM20.5 5A1.5 1.5 0 0 0 19 3.5h-4.5A2.5 2.5 0 0 0 12 6v14a2 2 0 0 1 2-2h5a1.5 1.5 0 0 0 1.5-1.5V5Z" />
  </Svg>
);

export const ChatIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 11.5c0-4.1 3.6-7.5 8-7.5s8 3.4 8 7.5-3.6 7.5-8 7.5c-1.3 0-2.6-.3-3.7-.8L4 19.5l1.2-3.6A7 7 0 0 1 4 11.5Z" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth={2.4} />
  </Svg>
);

/** Counter-clockwise arrow: start over. */
export const ResetIcon = (p: P) => (
  <Svg strokeWidth={1.9} {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4.5 4.5v4h4" />
  </Svg>
);

export const CheckIcon = (p: P) => (
  <Svg strokeWidth={2.4} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
);

export const CloseIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);

/** Soft gold tile for empty states. */
export function IconTile({ children }: { children: React.ReactNode }) {
  return <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">{children}</span>;
}
