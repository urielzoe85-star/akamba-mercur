'use client';

import { Capacitor } from '@capacitor/core';

import { BRAND } from '@/config/brand';

const allowedWebHosts = new Set(
  [
    new URL(BRAND.baseUrl).host,
    ...(process.env.NEXT_PUBLIC_DEEP_LINK_HOSTS || '')
      .split(',')
      .map(host => host.trim())
      .filter(Boolean)
  ].filter(Boolean)
);

export const isNativeApp = () => Capacitor.isNativePlatform();

export const toStorefrontPath = (url: string) => {
  try {
    const parsed = new URL(url);
    const customScheme = `${BRAND.mobile.scheme}:`;
    let pathname: string;

    if (parsed.protocol === customScheme) {
      pathname = `/${parsed.host}${parsed.pathname}`;
    } else if (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      allowedWebHosts.has(parsed.host)
    ) {
      pathname = parsed.pathname;
    } else {
      return null;
    }

    const normalizedPath = pathname.replace(/\/+/g, '/') || '/';
    return `${normalizedPath}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

export const openOAuthUrl = async (authorizeUrl: string) => {
  const parsed = new URL(authorizeUrl);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('OAuth authorization URL must use HTTP(S)');
  }

  if (isNativeApp()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: parsed.toString(), presentationStyle: 'popover' });
    return;
  }

  window.location.assign(parsed.toString());
};

export const mobileOAuthCallbackUrl = () => `${BRAND.mobile.scheme}://auth/callback`;
