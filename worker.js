import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // Serve static assets from the built Next.js app
    return await getAssetFromKV(event, {
      mapRequestToAsset: req => {
        // Handle Next.js routing
        const url = new URL(req.url);
        
        // Handle dynamic routes that should serve index.html
        if (url.pathname.startsWith('/archive/')) {
          // For dynamic archive routes, serve the appropriate generated HTML
          if (url.pathname.match(/^\/archive\/\d{4}$/)) {
            return new Request(`${url.origin}/archive/[year].html`, req);
          }
          if (url.pathname.match(/^\/archive\/\d{4}\/\w+$/)) {
            return new Request(`${url.origin}/archive/[year]/[season].html`, req);
          }
          if (url.pathname.match(/^\/archive\/\d{4}\/\w+\/games$/)) {
            return new Request(`${url.origin}/archive/[year]/[season]/games.html`, req);
          }
        }
        
        // Default handling
        return req;
      }
    });
  } catch (e) {
    // If asset not found, serve 404
    return new Response('Not found', { status: 404 });
  }
}
