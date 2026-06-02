export const runtime = 'edge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipmaia-winterjam.pt/api';

/**
 * GET /api/gamejams
 *
 * Edge-compatible proxy: forwards to the backend public API and returns the result.
 * This replaces the previous in-memory cache pattern, which is not compatible with
 * the Cloudflare Workers edge runtime.
 */
export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/public/gamejams`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch game jams' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Data not available. Please try again shortly.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
