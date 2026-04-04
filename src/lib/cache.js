// In-memory cache module for Next.js server-side data
// Data is fetched from the backend API and stored in module-level variables
// that persist for the lifetime of the server process.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '60000', 10); // Default: 60 seconds

/** @type {{ gameJams: any[]|null, activeGameJam: any|null, featuredGames: any[]|null }} */
let cachedData = {
  gameJams: null,
  activeGameJam: null,
  featuredGames: null,
};

/** @type {number|null} */
let lastFetched = null;

// Singleton interval reference — prevents duplicate intervals when the module is
// re-evaluated during Next.js hot reloads in development.
/** @type {ReturnType<typeof setInterval>|null} */
let refreshInterval = null;

/**
 * Returns the current in-memory cached data.
 * @returns {{ gameJams: any[]|null, activeGameJam: any|null, featuredGames: any[]|null }}
 */
export function getData() {
  return cachedData;
}

/**
 * Fetches all cacheable data from the backend API.
 * Individual endpoint failures are logged but do not prevent other endpoints
 * from being fetched. Returns null for any endpoint that fails.
 * @returns {Promise<{ gameJams: any[]|null, activeGameJam: any|null, featuredGames: any[]|null }>}
 */
async function fetchAllData() {
  const headers = { 'Content-Type': 'application/json' };

  const [gameJamsRes, activeGameJamRes, featuredGamesRes] = await Promise.all([
    fetch(`${API_BASE_URL}/public/gamejams`, { headers }),
    fetch(`${API_BASE_URL}/public/gamejams/active/current`, { headers }),
    fetch(`${API_BASE_URL}/public/games/featured?limit=6`, { headers }),
  ]);

  if (!gameJamsRes.ok) {
    console.error(`[Cache] Failed to fetch game jams: HTTP ${gameJamsRes.status}`);
  }
  if (!activeGameJamRes.ok) {
    console.error(`[Cache] Failed to fetch active game jam: HTTP ${activeGameJamRes.status}`);
  }
  if (!featuredGamesRes.ok) {
    console.error(`[Cache] Failed to fetch featured games: HTTP ${featuredGamesRes.status}`);
  }

  const gameJams = gameJamsRes.ok ? await gameJamsRes.json() : null;
  const activeGameJam = activeGameJamRes.ok ? await activeGameJamRes.json() : null;
  const featuredGames = featuredGamesRes.ok ? await featuredGamesRes.json() : null;

  return { gameJams, activeGameJam, featuredGames };
}

/**
 * Warms the in-memory cache by fetching data from the backend API,
 * then schedules periodic refreshes using setInterval.
 *
 * The setInterval keeps running silently in the background — no client
 * request ever triggers a backend hit after the initial warm.
 *
 * Uses a singleton interval to prevent duplicate timers during Next.js
 * hot reloads in development.
 */
export async function warmCache() {
  try {
    cachedData = await fetchAllData();
    lastFetched = Date.now();
    console.log('[Cache] Cache warmed at', new Date(lastFetched).toISOString());
  } catch (error) {
    console.error('[Cache] Failed to warm cache on startup:', error);
  }

  // Guard against duplicate intervals (e.g. during hot reload)
  if (refreshInterval !== null) {
    return;
  }

  refreshInterval = setInterval(async () => {
    try {
      const fresh = await fetchAllData();
      // Merge fresh data, keeping last known good values for any fields that failed
      cachedData = {
        gameJams: fresh.gameJams ?? cachedData.gameJams,
        activeGameJam: fresh.activeGameJam ?? cachedData.activeGameJam,
        featuredGames: fresh.featuredGames ?? cachedData.featuredGames,
      };
      lastFetched = Date.now();
      console.log('[Cache] Cache refreshed at', new Date(lastFetched).toISOString());
    } catch (error) {
      // Log the error but keep serving the last known good data
      console.error('[Cache] Failed to refresh cache, keeping last known good data:', error);
    }
  }, CACHE_TTL);
}
