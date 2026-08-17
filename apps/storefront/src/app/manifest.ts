import type { MetadataRoute } from 'next';

import { BRAND } from '@/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: `/${BRAND.countryCode}`,
    display: 'standalone',
    background_color: '#f5f0e6',
    theme_color: '#0b6b3a',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      }
    ]
  };
}
