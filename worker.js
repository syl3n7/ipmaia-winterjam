export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle static assets (JS, CSS, images, etc.)
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|pdf|woff|woff2|ttf|eot)$/)) {
      return env.ASSETS.fetch(request);
    }
    
    // Handle dynamic routes
    let assetPath = url.pathname;
    
    // For dynamic archive routes, map to the correct static files
    if (url.pathname.startsWith('/archive/')) {
      // Handle /archive/[year] -> redirect to /archive/[year]/[season]
      if (url.pathname.match(/^\/archive\/\d{4}$/)) {
        assetPath = '/archive/[year].html';
      }
      // Handle /archive/[year]/[season]
      else if (url.pathname.match(/^\/archive\/\d{4}\/\w+$/)) {
        assetPath = '/archive/[year]/[season].html';
      }
      // Handle /archive/[year]/[season]/games
      else if (url.pathname.match(/^\/archive\/\d{4}\/\w+\/games$/)) {
        assetPath = '/archive/[year]/[season]/games.html';
      }
    }
    
    // Try to fetch the asset
    const assetRequest = new Request(new URL(assetPath, request.url), request);
    const response = await env.ASSETS.fetch(assetRequest);
    
    if (response.status === 404) {
      // If not found, try index.html for SPA routing
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      if (indexResponse.status === 200) {
        return new Response(indexResponse.body, {
          ...indexResponse,
          headers: {
            ...indexResponse.headers,
            'Content-Type': 'text/html'
          }
        });
      }
      // If still not found, return 404
      return new Response('Not found', { status: 404 });
    }
    
    // Return the response with proper content-type for HTML
    if (assetPath.endsWith('.html') || !assetPath.includes('.')) {
      return new Response(response.body, {
        ...response,
        headers: {
          ...response.headers,
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
    
    return response;
  },
};
