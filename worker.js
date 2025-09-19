export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Enforce HTTP/2+ only connections
    const httpVersion = request.cf?.httpProtocol || '';
    const tlsVersion = request.cf?.tlsVersion || '';
    
    // Block HTTP/1.0 and HTTP/1.1 requests
    if (httpVersion.startsWith('HTTP/1.')) {
      return new Response(
        JSON.stringify({
          error: 'HTTP/1.x not supported',
          message: 'This server only accepts HTTP/2 or HTTP/3 connections for security reasons.',
          supported_protocols: ['HTTP/2', 'HTTP/3'],
          current_protocol: httpVersion,
          upgrade_required: true
        }),
        {
          status: 426, // Upgrade Required
          headers: {
            'Content-Type': 'application/json',
            'Upgrade': 'h2,h3',
            'Alt-Svc': 'h3=":443"; ma=86400, h2=":443"; ma=86400',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
          }
        }
      );
    }

    // Ensure HTTPS is being used
    if (url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
      return Response.redirect(`https://${url.host}${url.pathname}${url.search}`, 301);
    }
    
    // Handle static assets (JS, CSS, images, etc.)
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|pdf|woff|woff2|ttf|eot)$/)) {
      // Rewrite _next paths to remove the _next prefix for Cloudflare Workers
      let assetPath = url.pathname;
      if (assetPath.startsWith('/_next/')) {
        assetPath = assetPath.replace('/_next/', '/');
      }
      
      const assetRequest = new Request(new URL(assetPath, request.url), request);
      const response = await env.ASSETS.fetch(assetRequest);
      return addSecurityHeaders(response);
    }
    
    // Handle dynamic routes by mapping to generated HTML files
    let assetPath = url.pathname;
    
    // Map routes to the actual HTML files in server/app/
    if (url.pathname === '/') {
      assetPath = '/server/app/index.html';
    }
    else if (url.pathname === '/archive') {
      assetPath = '/server/app/archive.html';
    }
    else if (url.pathname === '/games') {
      assetPath = '/server/app/games.html';
    }
    else if (url.pathname === '/rules') {
      assetPath = '/server/app/rules.html';
    }
    else if (url.pathname === '/enlist-now') {
      assetPath = '/server/app/enlist-now.html';
    }
    // For dynamic archive routes, map to the correct static files
    else if (url.pathname.startsWith('/archive/')) {
      // Handle /archive/[year]
      if (url.pathname.match(/^\/archive\/\d{4}$/)) {
        assetPath = '/server/app/archive/[year].html';
      }
      // Handle /archive/[year]/[season]
      else if (url.pathname.match(/^\/archive\/\d{4}\/\w+$/)) {
        assetPath = '/server/app/archive/[year]/[season].html';
      }
      // Handle /archive/[year]/[season]/games
      else if (url.pathname.match(/^\/archive\/\d{4}\/\w+\/games$/)) {
        assetPath = '/server/app/archive/[year]/[season]/games.html';
      }
    }
    
    // Try to fetch the asset
    const assetRequest = new Request(new URL(assetPath, request.url), request);
    const response = await env.ASSETS.fetch(assetRequest);
    
    if (response.status === 404) {
      // If not found, try index.html for SPA routing
      const indexRequest = new Request(new URL('/server/app/index.html', request.url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      if (indexResponse.status === 200) {
        return addSecurityHeaders(new Response(indexResponse.body, {
          ...indexResponse,
          headers: {
            ...indexResponse.headers,
            'Content-Type': 'text/html; charset=utf-8'
          }
        }));
      }
      // If still not found, return 404 with security headers
      return addSecurityHeaders(new Response('Not found', { status: 404 }));
    }
    
    // Return the response with proper content-type for HTML and security headers
    if (assetPath.endsWith('.html') || !assetPath.includes('.')) {
      return addSecurityHeaders(new Response(response.body, {
        ...response,
        headers: {
          ...response.headers,
          'Content-Type': 'text/html; charset=utf-8'
        }
      }));
    }
    
    return addSecurityHeaders(response);
  },
};

// Function to add security headers to all responses
function addSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);
  
  // Security headers
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  newHeaders.set('Alt-Svc', 'h3=":443"; ma=86400, h2=":443"; ma=86400');
  
  // Content Security Policy
  newHeaders.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://rsms.me; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://rsms.me; " +
    "connect-src 'self' https://cloudflareinsights.com; " +
    "frame-ancestors 'none';"
  );
  
  // Remove server identification headers
  newHeaders.delete('Server');
  newHeaders.delete('X-Powered-By');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
