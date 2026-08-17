const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const BRAND = Object.freeze({
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'AKAMBA',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    'La marketplace camerounaise pour acheter, vendre et livrer en toute confiance.',
  baseUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:3000'),
  logo: '/Logo.svg',
  openGraphImage: '/akamba-open-graph.svg',
  countryCode: (process.env.NEXT_PUBLIC_DEFAULT_REGION?.trim() || 'cm').toLowerCase(),
  currencyCode: (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY?.trim() || 'xaf').toLowerCase(),
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim() || 'fr-CM',
  mobile: {
    appId: process.env.NEXT_PUBLIC_MOBILE_APP_ID?.trim() || 'cm.akamba.app',
    scheme: process.env.NEXT_PUBLIC_MOBILE_SCHEME?.trim() || 'akamba'
  }
});

export const getSiteUrl = (fallback?: string) =>
  process.env.NEXT_PUBLIC_BASE_URL?.trim()
    ? BRAND.baseUrl
    : trimTrailingSlash(fallback || BRAND.baseUrl);
