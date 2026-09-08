// API client for backend communication

import { API_BASE_URL } from '@/utils/api';

const REQUEST_TIMEOUT_MS = 10000;
const MAX_GET_RETRIES = 2;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const method = (options.method || 'GET').toUpperCase();
    const canRetry = method === 'GET';
    let lastError;

    for (let attempt = 0; attempt <= (canRetry ? MAX_GET_RETRIES : 0); attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
        signal: options.signal || controller.signal,
      };

      if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
      }

      try {
        const response = await fetch(url, config);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const error = new ApiError(
            payload?.error || payload?.message || `Request failed with HTTP ${response.status}`,
            { status: response.status, code: payload?.code, details: payload?.details }
          );
          if (!canRetry || response.status < 500 || attempt === MAX_GET_RETRIES) throw error;
          lastError = error;
          continue;
        }

        return payload;
      } catch (error) {
        lastError = error.name === 'AbortError'
          ? new ApiError('The request timed out', { code: 'REQUEST_TIMEOUT' })
          : error;
        if (!canRetry || attempt === MAX_GET_RETRIES) throw lastError;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError;
  }

  // Public API methods
  async getGameJams() {
    return this.request('/public/gamejams');
  }

  async getGameJam(id) {
    return this.request(`/public/gamejams/${id}`);
  }

  async getGameJamGames(id) {
    return this.request(`/public/gamejams/${id}/games`);
  }

  async getActiveGameJam() {
    return this.request('/public/gamejams/active/current');
  }

  async getFeaturedGames(limit = 6) {
    return this.request(`/public/games/featured?limit=${limit}`);
  }

  async searchGames(query) {
    return this.request(`/public/games/search?q=${encodeURIComponent(query)}`);
  }

  async getGame(id) {
    return this.request(`/public/games/${id}`);
  }

  async getArchive(year) {
    return this.request(`/public/archive/${year}`);
  }

  async getArchiveSeason(year, season) {
    return this.request(`/public/archive/${year}/${season}`);
  }

  // Fallback to static data if backend is not available
  async getGameJamsWithFallback() {
    try {
      return await this.getGameJams();
    } catch (error) {
      // Return static data from your current gameJamData.js
      const { gameJamData } = await import('../data/gameJamData');
      return [gameJamData[2025]?.winter].filter(Boolean);
    }
  }

  async getActiveGameJamWithFallback() {
    try {
      return await this.getActiveGameJam();
    } catch (error) {
      const { gameJamData } = await import('../data/gameJamData');
      return gameJamData[2025]?.winter || null;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;