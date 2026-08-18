import { HttpTypes } from '@medusajs/types';
import { NextRequest, NextResponse } from 'next/server';

import { BRAND } from './config/brand';
import { PROTECTED_ROUTES } from './lib/constants';
import { isTokenExpired } from './lib/helpers/token';
import {
  getCountrySegment,
  isProtectedPath,
  localizePathname,
  selectCountryCode
} from './lib/middleware-utils';

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const DEFAULT_COUNTRY_CODE = BRAND.countryCode;
const REGION_CACHE_TTL = 60 * 60 * 1000;
const REGION_FETCH_TIMEOUT = 5000;

const makeAuthRedirect = (
  req: NextRequest,
  locale: string,
  reason: 'sessionRequired' | 'sessionExpired'
) => {
  const redirectUrl = new URL(`/${locale}/login`, req.url);

  redirectUrl.searchParams.set(reason, 'true');
  redirectUrl.searchParams.set('redirectTo', `${req.nextUrl.pathname}${req.nextUrl.search}`);

  const response = NextResponse.redirect(redirectUrl);

  if (reason === 'sessionExpired') {
    response.cookies.delete('_medusa_jwt');
  }

  return response;
};

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: 0
};

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (!BACKEND_URL || !PUBLISHABLE_API_KEY) {
    throw new Error(
      'Storefront middleware requires MEDUSA_BACKEND_URL and NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.'
    );
  }

  if (!regionMap.size || regionMapUpdated < Date.now() - REGION_CACHE_TTL) {
    try {
      // The Mercur client is Node-oriented; middleware must use an Edge-safe fetch.
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(REGION_FETCH_TIMEOUT)
      });
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        regions?: HttpTypes.StoreRegion[];
      };

      if (!response.ok) {
        throw new Error(payload.message || `Medusa returned ${response.status}`);
      }

      const regions = payload.regions;

      if (!regions?.length) {
        throw new Error('No Storefront regions are configured in Medusa.');
      }

      const refreshedMap = new Map<string, HttpTypes.StoreRegion>();
      regions.forEach(region => {
        region.countries?.forEach(country => {
          if (country.iso_2) refreshedMap.set(country.iso_2.toLowerCase(), region);
        });
      });

      if (!refreshedMap.size) {
        throw new Error('Medusa regions do not contain any country codes.');
      }

      regionMapCache.regionMap = refreshedMap;
      regionMapCache.regionMapUpdated = Date.now();
    } catch (error) {
      if (!regionMapCache.regionMap.size) throw error;

      console.error('Storefront middleware is using its stale region cache.', error);
    }
  }

  return regionMapCache.regionMap;
}

const setCacheCookie = (response: NextResponse, cacheId: string) => {
  response.cookies.set('_medusa_cache_id', cacheId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return response;
};

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const cacheIdCookie = request.cookies.get('_medusa_cache_id');
  const cacheId = cacheIdCookie?.value || crypto.randomUUID();

  let regionMap = new Map<string, HttpTypes.StoreRegion>();
  try {
    regionMap = await getRegionMap(cacheId);
  } catch (error) {
    console.error('Storefront middleware could not refresh Medusa regions.', error);
  }

  const urlCountryCode = getCountrySegment(pathname);
  const countryCode =
    selectCountryCode({
      pathname,
      vercelCountryCode: request.headers.get('x-vercel-ip-country'),
      availableCountryCodes: regionMap.keys(),
      defaultCountryCode: DEFAULT_COUNTRY_CODE
    }) || DEFAULT_COUNTRY_CODE;
  const hasValidCountryCode = Boolean(
    urlCountryCode &&
    (regionMap.has(urlCountryCode) || (!regionMap.size && urlCountryCode === DEFAULT_COUNTRY_CODE))
  );

  const isProtectedRoute = isProtectedPath(pathname, PROTECTED_ROUTES);

  if (isProtectedRoute) {
    const jwtCookie = request.cookies.get('_medusa_jwt');
    const token = jwtCookie?.value;

    const locale = hasValidCountryCode ? urlCountryCode! : countryCode;

    if (!jwtCookie) {
      return setCacheCookie(makeAuthRedirect(request, locale, 'sessionRequired'), cacheId);
    }

    if (token && isTokenExpired(token)) {
      return setCacheCookie(makeAuthRedirect(request, locale, 'sessionExpired'), cacheId);
    }
  }

  if (!hasValidCountryCode) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizePathname(pathname, countryCode);
    return setCacheCookie(NextResponse.redirect(redirectUrl, 307), cacheId);
  }

  const response = NextResponse.next();
  return cacheIdCookie ? response : setCacheCookie(response, cacheId);
}

export const config = {
  matcher: [
    '/((?!api|admin|vendor|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)'
  ]
};
