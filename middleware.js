import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the HTTP version from headers
  const httpVersion = request.headers.get('http-version') || 
                     request.headers.get(':version') || 
                     request.headers.get('x-http-version');
  
  // Check for HTTP/1.x indicators in various headers
  const userAgent = request.headers.get('user-agent') || '';
  const connection = request.headers.get('connection') || '';
  const upgrade = request.headers.get('upgrade') || '';
  
  // Block HTTP/1.0 and HTTP/1.1 requests
  if (httpVersion && (httpVersion === '1.0' || httpVersion === '1.1')) {
    return new NextResponse(
      JSON.stringify({
        error: 'HTTP/1.x not supported',
        message: 'This server only accepts HTTP/2 or HTTP/3 connections for security reasons.',
        supported_protocols: ['HTTP/2', 'HTTP/3']
      }),
      {
        status: 426, // Upgrade Required
        headers: {
          'Content-Type': 'application/json',
          'Upgrade': 'h2,h3',
          'Connection': 'upgrade',
          'Alt-Svc': 'h3=":443"; ma=86400, h2=":443"; ma=86400',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      }
    );
  }

  // Additional checks for HTTP/1.x patterns
  // HTTP/2 connections typically don't have 'Connection: keep-alive' or 'Connection: close'
  if (connection.toLowerCase().includes('keep-alive') || 
      connection.toLowerCase().includes('close')) {
    
    // However, allow if it's clearly an HTTP/2 request with other indicators
    const hasHttp2Indicators = 
      request.headers.get(':method') || // HTTP/2 uses pseudo-headers
      request.headers.get(':path') ||
      request.headers.get(':scheme') ||
      request.headers.get(':authority') ||
      upgrade.toLowerCase().includes('h2') ||
      userAgent.includes('HTTP/2') ||
      userAgent.includes('h2');
    
    if (!hasHttp2Indicators) {
      return new NextResponse(
        JSON.stringify({
          error: 'HTTP/1.x connection detected',
          message: 'This server only accepts HTTP/2 or HTTP/3 connections for security reasons.',
          supported_protocols: ['HTTP/2', 'HTTP/3'],
          upgrade_info: 'Please use a client that supports HTTP/2 or HTTP/3'
        }),
        {
          status: 426, // Upgrade Required
          headers: {
            'Content-Type': 'application/json',
            'Upgrade': 'h2,h3',
            'Connection': 'upgrade',
            'Alt-Svc': 'h3=":443"; ma=86400, h2=":443"; ma=86400',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
          }
        }
      );
    }
  }

  // Add security headers to all valid requests
  const response = NextResponse.next();
  
  // Security headers for HTTP/2+ requests
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Alt-Svc', 'h3=":443"; ma=86400, h2=":443"; ma=86400');
  
  // Remove server identification headers
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
