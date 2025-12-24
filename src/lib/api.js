// API client for backend communication

import { API_BASE_URL } from '@/utils/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for sessions
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
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