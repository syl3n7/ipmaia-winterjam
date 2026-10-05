const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipmaia-winterjam.pt/api';
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const baseUrl = API_URL.replace(/\/api$/, '');
    const res = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
    if (!res.ok) {
      return Response.json({ status: 'error' }, { status: 503, headers: NO_STORE_HEADERS });
    }
    const maintenanceRes = await fetch(`${API_URL}/public/maintenance`, { cache: 'no-store' });
    if (!maintenanceRes.ok) {
      return Response.json({ status: 'error' }, { status: 503, headers: NO_STORE_HEADERS });
    }

    const data = await maintenanceRes.json();
    if (data.enabled) {
      return Response.json({ status: 'maintenance' }, { status: 503, headers: NO_STORE_HEADERS });
    }

    return Response.json({ status: 'ok' }, { status: 200, headers: NO_STORE_HEADERS });
  } catch {
    return Response.json({ status: 'error' }, { status: 503, headers: NO_STORE_HEADERS });
  }
}
