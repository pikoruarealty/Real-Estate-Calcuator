import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import { BRAND } from '@/config/brand';
import './globals.css';

// latin-ext carries the ₹ glyph
const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist', display: 'swap' });

const title = 'Real Estate Calculator: true area, all-in cost & EMI';
const description =
  'Turn any property quote into carpet and super built-up area, a full cost sheet with GST, stamp duty and registration, plus loan eligibility and EMI. Free, no login.';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title,
  description,
  keywords: ['real estate calculator', 'carpet area', 'super built-up', 'stamp duty', 'GST on flat', 'EMI calculator', 'kapat', 'loading', 'Jantri'],
  openGraph: { title, description, type: 'website', url: BRAND.siteUrl, siteName: BRAND.name, locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title, description },
  icons: { icon: '/logo.svg' },
};

export const viewport: Viewport = { themeColor: '#0B0B0B', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en-IN" className={geist.variable}>
      <body className="min-h-screen antialiased">
        {children}
        {plausible && <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
