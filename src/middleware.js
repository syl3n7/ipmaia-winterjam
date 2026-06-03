import { NextResponse } from 'next/server';

export const runtime = 'edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipmaia-winterjam.pt/api';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Never intercept admin routes, the maintenance page itself, or API routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/api/health-check') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${API_URL}/public/maintenance`, {
      // Cache for 15 seconds at the edge to avoid hammering the backend
      cf: { cacheTtl: 15, cacheEverything: true },
      next: { revalidate: 15 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.enabled) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  } catch {
    // If the backend is unreachable, don't block the visitor
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and internal Next.js paths.
     * We handle the exclusions above in the function itself for clarity.
     */
    '/((?!_next/static|_next/image|images|robots.txt|sitemap|favicon).*)',
  ],
};
