export const dynamic = 'force-dynamic';

export async function GET() {
  const frontendVersion = {
    service: 'frontend',
    version: process.env.APP_VERSION || 'unknown',
    buildDate: process.env.BUILD_DATE || 'unknown',
    gitSha: process.env.GIT_SHA || 'unknown',
  };

  return Response.json(frontendVersion, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
