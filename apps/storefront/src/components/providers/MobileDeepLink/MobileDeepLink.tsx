'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { BRAND } from '@/config/brand';
import { isNativeApp, toStorefrontPath } from '@/lib/mobile';

export function MobileDeepLink() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;

    let disposed = false;
    let removeListener: (() => Promise<void>) | undefined;

    const navigate = async (url: string) => {
      const path = toStorefrontPath(url);
      if (!path || disposed) return;

      const { Browser } = await import('@capacitor/browser');
      await Browser.close().catch(() => undefined);

      const authCallback = path.startsWith('/auth/callback');
      router.replace(
        authCallback ? `/${BRAND.countryCode}/login${path.slice('/auth/callback'.length)}` : path
      );
    };

    void (async () => {
      const { App } = await import('@capacitor/app');
      const launchUrl = await App.getLaunchUrl();
      if (launchUrl?.url) await navigate(launchUrl.url);

      const handle = await App.addListener('appUrlOpen', ({ url }) => {
        void navigate(url);
      });
      removeListener = () => handle.remove();
    })();

    return () => {
      disposed = true;
      void removeListener?.();
    };
  }, [router]);

  return null;
}
