import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import Script from 'next/script';
import { BRAND } from '@/config/brand';
import './globals.css';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['600'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const title = 'Ahmedabad Real Estate Calculator: true area, all-in cost & EMI';
const description =
  'Turn any Ahmedabad property quote into carpet and super built-up area, a full cost sheet with GST, stamp duty and registration, plus loan eligibility and EMI. Free, no login.';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title,
  description,
  keywords: ['Ahmedabad real estate calculator', 'carpet area', 'super built-up', 'stamp duty Gujarat', 'GST on flat', 'EMI calculator', 'kapat', 'loading', 'Jantri'],
  openGraph: { title, description, type: 'website', url: BRAND.siteUrl, siteName: BRAND.name, locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title, description },
  icons: { icon: '/logo.svg' },
};

export const viewport: Viewport = { themeColor: '#0B0B0B', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        {plausible && <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
