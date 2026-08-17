import { BRAND } from '@/config/brand';

export const dynamic = 'force-dynamic';

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId) {
    return Response.json(
      { error: 'APPLE_TEAM_ID is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const appId = `${teamId}.${BRAND.mobile.appId}`;
  return Response.json(
    {
      applinks: {
        apps: [],
        details: [{ appID: appId, components: [{ '/': '/*' }] }]
      },
      webcredentials: { apps: [appId] }
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
