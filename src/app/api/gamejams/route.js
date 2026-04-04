import { NextResponse } from 'next/server';
import { getData } from '@/lib/cache';

/**
 * GET /api/gamejams
 *
 * Returns the cached list of all game jams.
 * Data is served from the in-memory cache populated by warmCache() at server boot,
 * so no database round-trip is made per request.
 */
export async function GET() {
  const { gameJams } = getData();

  if (!gameJams) {
    return NextResponse.json(
      { error: 'Data not available yet. Please try again shortly.' },
      { status: 503 }
    );
  }

  return NextResponse.json(gameJams);
}
