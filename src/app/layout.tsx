import type { Metadata, Viewport } from 'next';
import './globals.css';
import { env } from '@/lib/env';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

const siteUrl = env.SITE_URL;
const name = env.RESTAURANT_NAME;
const description =
  'Электронное меню FUMA LOUNGE — премиальная кальянная. Авторский чай, кофе, натуральные лимонады и чайные церемонии.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${name} — Электронное меню`,
    template: `%s — ${name}`,
  },
  description,
  applicationName: name,
  keywords: [
    'FUMA LOUNGE',
    'кальянная',
    'меню',
    'чай',
    'кофе',
    'лимонады',
    'QR меню',
    'премиум лаундж',
  ],
  authors: [{ name }],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: name,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: name,
    title: `${name} — Электронное меню`,
    description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${name} — Электронное меню`,
    description,
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0E0E0E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
