import type { Metadata } from 'next';

import './globals.css';

import { Toaster } from '@medusajs/ui';

import { HtmlLangSetter } from '@/components/atoms/HtmlLangSetter/HtmlLangSetter';
import { BRAND } from '@/config/brand';
import { retrieveCart } from '@/lib/data/cart';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    template: `%s | ${BRAND.name}`,
    default: BRAND.name
  },
  description: BRAND.description,
  metadataBase: new URL(BRAND.baseUrl),
  applicationName: BRAND.name,
  manifest: '/manifest.webmanifest'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await retrieveCart();

  // default lang updated by HtmlLangSetter
  const htmlLang = BRAND.locale;

  return (
    <html
      lang={htmlLang}
      className=""
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.gstatic.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://i.imgur.com"
        />
        {/* Image origins for faster LCP */}
        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://api.mercurjs.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://api.mercurjs.com"
        />
      </head>
      <body className="relative bg-primary text-secondary antialiased">
        <HtmlLangSetter />
        <Providers cart={cart}>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
