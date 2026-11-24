import { ImageResponse } from 'next/og';
import { BRAND } from '@/config/brand';

export const alt = 'Real Estate Calculator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0B0B0B', color: '#F5F2EA', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80 }}>
        <div style={{ fontSize: 34, color: '#D4AF37', letterSpacing: 4, textTransform: 'uppercase' }}>{BRAND.name}</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 24, lineHeight: 1.05, color: '#D4AF37' }}>Know the real price of your home</div>
        <div style={{ fontSize: 34, marginTop: 36, color: '#9A968C' }}>True area · All-in cost with GST &amp; stamp duty · EMI</div>
      </div>
    ),
    size,
  );
}
