/**
 * Compatibility shim for the OpenNext Cloudflare bundle.
 * Provides the server-side instrumentation entry expected by the build.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { warmCache } = await import('../src/lib/cache.js');
    await warmCache();
  }
}
