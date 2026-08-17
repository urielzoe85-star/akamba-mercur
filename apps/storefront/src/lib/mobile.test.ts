import { describe, expect, test } from 'bun:test';

import { BRAND } from '@/config/brand';

import { toStorefrontPath } from './mobile';

describe('mobile deep links', () => {
  test('maps the AKAMBA OAuth callback to a Storefront path', () => {
    expect(toStorefrontPath(`${BRAND.mobile.scheme}://auth/callback?code=abc&state=123`)).toBe(
      '/auth/callback?code=abc&state=123'
    );
  });

  test('accepts configured Storefront web links', () => {
    expect(toStorefrontPath(`${BRAND.baseUrl}/cm/products/example#details`)).toBe(
      '/cm/products/example#details'
    );
  });

  test('rejects untrusted web origins and unsupported protocols', () => {
    expect(toStorefrontPath('https://example.invalid/cm/user')).toBeNull();
    expect(toStorefrontPath('javascript:alert(1)')).toBeNull();
  });
});
