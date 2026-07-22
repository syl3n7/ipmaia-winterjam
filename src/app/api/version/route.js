export async function GET() {
  const frontendVersion = {
    service: 'frontend',
    version: process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION || '1.0.0-dev',
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || process.env.BUILD_DATE || 'unknown',
    gitSha: process.env.NEXT_PUBLIC_GIT_SHA || process.env.GIT_SHA || 'unknown',
  };

  return Response.json(frontendVersion, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
