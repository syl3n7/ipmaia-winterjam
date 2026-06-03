const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipmaia-winterjam.pt/api';

export async function GET() {
  try {
    const baseUrl = API_URL.replace(/\/api$/, '');
    const res = await fetch(`${baseUrl}/health`);
    if (!res.ok) {
      return new Response(JSON.stringify({ status: 'error' }), { status: 503 });
    }
    // Also check if maintenance is still on
    const mainRes = await fetch(`${API_URL}/public/maintenance`);
    if (mainRes.ok) {
      const data = await mainRes.json();
      if (data.enabled) {
        return new Response(JSON.stringify({ status: 'maintenance' }), { status: 503 });
      }
    }
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ status: 'error' }), { status: 503 });
  }
}
