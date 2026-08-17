'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { toHreflang } from '@/lib/helpers/hreflang';
import { BRAND } from '@/config/brand';

export function HtmlLangSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const localeMatch = pathname?.match(/^\/([a-z]{2})(?:\/|$)/i);
    const locale = localeMatch?.[1] || BRAND.countryCode;
    const htmlLang = toHreflang(locale);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = htmlLang;
    }
  }, [pathname]);

  return null;
}
