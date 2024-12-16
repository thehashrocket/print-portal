import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Thomson Print Portal',
    short_name: 'Thomson Print Portal',
    description: 'Thomson Print Portal',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/favicon-196x196.png',
        sizes: '196x196',
        type: 'image/png',
      },
      {
        src: '/images/thomson-pdf-logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}