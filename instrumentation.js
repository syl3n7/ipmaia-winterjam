/**
 * Next.js instrumentation file.
 * This hook runs once when the server boots, before any request is handled.
 * It warms the in-memory cache so the first request is always served from memory.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run in the Node.js runtime, not in the Edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { warmCache } = await import('./src/lib/cache.js');
    await warmCache();
  }
}
