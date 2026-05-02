const fetch = require('node-fetch');

const POLL_INTERVAL_MS = 90 * 1000; // 90 seconds
const CFN_USERNAME = process.env.SF6_CFN_USERNAME || 'Galoz';
const TRACKER_URL = `https://tracker.gg/api/v2/street-fighter-6/standard/profile/cfn/${encodeURIComponent(CFN_USERNAME)}`;

/** @type {{ username: string, wins: number, losses: number, winRate: number, lp: number|null, lastUpdated: string } | null} */
let cachedStats = null;

/**
 * Fetches the SF6 profile from tracker.gg and updates the in-memory cache.
 * Errors are logged but do NOT clear the cache so the last good data keeps
 * being served while tracker.gg is temporarily unreachable.
 */
async function fetchStats() {
  try {
    const response = await fetch(TRACKER_URL, {
      headers: {
        // tracker.gg blocks requests without a browser-like User-Agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://tracker.gg/',
      },
      timeout: 15000,
    });

    if (!response.ok) {
      console.warn(`⚠️  SF6 scraper: tracker.gg responded with HTTP ${response.status}`);
      return;
    }

    const data = await response.json();

    // tracker.gg response shape:
    // data.data.segments[0].stats.{ wins, losses, winRate, leaguePoints / masterRating }
    const segment = data?.data?.segments?.[0];
    const stats = segment?.stats;

    if (!stats) {
      console.warn('⚠️  SF6 scraper: unexpected response shape from tracker.gg');
      return;
    }

    const wins = stats.wins?.value ?? 0;
    const losses = stats.losses?.value ?? 0;
    const rawWinRate = stats.winRate?.value
      ?? (wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0);
    // LP for Diamond and below; Master Rating once at Master rank
    const lp = stats.leaguePoints?.value ?? stats.masterRating?.value ?? null;

    cachedStats = {
      username: CFN_USERNAME,
      wins,
      losses,
      winRate: parseFloat(rawWinRate.toFixed(1)),
      lp,
      lastUpdated: new Date().toISOString(),
    };

    console.log(
      `✅ SF6 scraper: updated stats for "${CFN_USERNAME}" — W:${wins} L:${losses} WR:${cachedStats.winRate}%`
    );
  } catch (error) {
    console.warn(`⚠️  SF6 scraper: fetch failed — ${error.message}`);
  }
}

/**
 * Returns the last successfully cached stats, or null if none yet.
 * @returns {typeof cachedStats}
 */
function getStats() {
  return cachedStats;
}

/**
 * Starts the background polling loop.
 * Fires immediately on startup, then every POLL_INTERVAL_MS milliseconds.
 */
function start() {
  console.log(
    `🎮 SF6 scraper: starting — polling tracker.gg for "${CFN_USERNAME}" every ${POLL_INTERVAL_MS / 1000}s`
  );
  fetchStats(); // immediate first fetch
  setInterval(fetchStats, POLL_INTERVAL_MS);
}

module.exports = { start, getStats };
