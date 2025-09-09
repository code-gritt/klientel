import { Metadata } from 'next';

export const SITE_CONFIG: Metadata = {
  title: {
    // Unique and catchy default title for Klientel
    default: 'Klientel – Smarter Client Management, Faster Growth',
    template: `%s | Klientel`,
  },
  description:
    'Klientel is a credit-based CRM that helps you manage clients, track pipelines, and grow your business with ease. Close deals faster, stay organized, and build lasting client relationships.',
  icons: {
    icon: [
      {
        url: '/icons/favicon.ico',
        href: '/icons/favicon.ico',
      },
    ],
  },
  openGraph: {
    title: 'Klientel – Smarter Client Management, Faster Growth',
    description:
      'Klientel is a credit-based CRM that helps you manage clients, track pipelines, and grow your business with ease. Close deals faster, stay organized, and build lasting client relationships.',
    images: [
      {
        url: '/assets/og-image.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@yourtwitterhandle', // update with your actual handle
    title: 'Klientel – Smarter Client Management, Faster Growth',
    description:
      'Klientel is a credit-based CRM that helps you manage clients, track pipelines, and grow your business with ease. Close deals faster, stay organized, and build lasting client relationships.',
    images: [
      {
        url: '/assets/og-image.png',
      },
    ],
  },
  metadataBase: new URL('https://klientel.vercel.app'),
};
