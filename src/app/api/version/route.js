import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET() {
  let runtimeEnv = {};
  try {
    const cloudflareContext = await getCloudflareContext({ async: true });
    runtimeEnv = cloudflareContext.env || {};
  } catch {
    // Local Next.js development does not provide a Cloudflare runtime context.
  }

  const frontendVersion = {
    service: 'frontend',
    version: runtimeEnv.NEXT_PUBLIC_APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION || 'unknown',
    buildDate: runtimeEnv.NEXT_PUBLIC_BUILD_DATE || process.env.NEXT_PUBLIC_BUILD_DATE || process.env.BUILD_DATE || 'unknown',
    gitSha: runtimeEnv.NEXT_PUBLIC_GIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || process.env.GIT_SHA || 'unknown',
  };

  return Response.json(frontendVersion, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
