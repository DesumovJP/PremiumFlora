import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Premium Flora — Оптові поставки квітів',
    short_name: 'Premium Flora',
    description: 'Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fbfa',
    theme_color: '#059669',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'uk',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
