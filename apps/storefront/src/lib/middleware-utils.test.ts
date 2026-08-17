import { describe, expect, it } from 'bun:test';

import {
  isProtectedPath,
  localizePathname,
  selectCountryCode,
  stripCountrySegment
} from './middleware-utils';

describe('storefront middleware helpers', () => {
  it('matches protected routes by segment, with or without a country prefix', () => {
    expect(isProtectedPath('/cm/user/orders', ['/user'])).toBe(true);
    expect(isProtectedPath('/user', ['/user'])).toBe(true);
    expect(isProtectedPath('/cm/userland', ['/user'])).toBe(false);
  });

  it('prefers a valid URL country over geolocation and defaults', () => {
    expect(
      selectCountryCode({
        pathname: '/cm/products',
        vercelCountryCode: 'fr',
        availableCountryCodes: ['cm', 'fr'],
        defaultCountryCode: 'cm'
      })
    ).toBe('cm');
  });

  it('falls back deterministically when geolocation is unsupported', () => {
    expect(
      selectCountryCode({
        pathname: '/products',
        vercelCountryCode: 'us',
        availableCountryCodes: ['cm'],
        defaultCountryCode: 'cm'
      })
    ).toBe('cm');
  });

  it('replaces invalid two-letter prefixes instead of nesting them', () => {
    expect(stripCountrySegment('/zz/products')).toBe('/products');
    expect(localizePathname('/zz/products', 'cm')).toBe('/cm/products');
  });
});
