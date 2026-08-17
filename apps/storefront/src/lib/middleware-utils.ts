export const normalizeCountryCode = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[a-z]{2}$/.test(normalized) ? normalized : undefined;
};

export const getCountrySegment = (pathname: string) => normalizeCountryCode(pathname.split('/')[1]);

export const stripCountrySegment = (pathname: string) => {
  if (!getCountrySegment(pathname)) return pathname || '/';

  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, '');
  return stripped || '/';
};

export const isProtectedPath = (pathname: string, protectedRoutes: readonly string[]) => {
  const normalizedPath = stripCountrySegment(pathname);

  return protectedRoutes.some(
    route => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );
};

export const selectCountryCode = ({
  pathname,
  vercelCountryCode,
  availableCountryCodes,
  defaultCountryCode
}: {
  pathname: string;
  vercelCountryCode?: string | null;
  availableCountryCodes: Iterable<string>;
  defaultCountryCode: string;
}) => {
  const available = new Set(Array.from(availableCountryCodes, code => code.toLowerCase()));
  const pathCountryCode = getCountrySegment(pathname);
  const edgeCountryCode = normalizeCountryCode(vercelCountryCode);
  const fallback = normalizeCountryCode(defaultCountryCode);

  if (pathCountryCode && available.has(pathCountryCode)) return pathCountryCode;
  if (edgeCountryCode && available.has(edgeCountryCode)) return edgeCountryCode;
  if (fallback && available.has(fallback)) return fallback;

  return available.values().next().value as string | undefined;
};

export const localizePathname = (pathname: string, countryCode: string) => {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!normalizedCountryCode) {
    throw new Error(`Invalid country code: ${countryCode}`);
  }

  const path = stripCountrySegment(pathname);
  return path === '/' ? `/${normalizedCountryCode}` : `/${normalizedCountryCode}${path}`;
};
