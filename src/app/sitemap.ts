import type { MetadataRoute } from 'next';
import { BRAND } from '@/config/brand';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: BRAND.siteUrl }, { url: `${BRAND.siteUrl}/terms` }];
}
