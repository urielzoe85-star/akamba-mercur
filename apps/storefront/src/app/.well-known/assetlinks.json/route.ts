import { BRAND } from '@/config/brand';

export const dynamic = 'force-dynamic';

export function GET() {
  const fingerprints = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS || '')
    .split(',')
    .map(fingerprint => fingerprint.trim())
    .filter(Boolean);

  if (!fingerprints.length) {
    return Response.json(
      { error: 'ANDROID_SHA256_CERT_FINGERPRINTS is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return Response.json(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: BRAND.mobile.appId,
          sha256_cert_fingerprints: fingerprints
        }
      }
    ],
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
