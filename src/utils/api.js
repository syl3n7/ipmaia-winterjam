// API utility functions for frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    } catch (parseError) {
      // If JSON parsing fails, use a generic error message
      throw new Error(`HTTP ${response.status}: ${response.statusText || 'Network error'}`);
    }
  }
  return response.json();
};

// Game Jam API calls
export const gameJamApi = {
  // Get all active game jams
  getAll: () => 
    fetch(`${API_BASE_URL}/public/gamejams`).then(handleResponse),
  
  // Get current active game jam
  getCurrent: () => 
    fetch(`${API_BASE_URL}/public/current`).then(handleResponse),
  
  // Get game jam by ID
  getById: (id) => 
    fetch(`${API_BASE_URL}/public/gamejams/${id}`).then(handleResponse),
  
  // Get games for a specific game jam
  getGames: (gameJamId) => 
    fetch(`${API_BASE_URL}/public/gamejams/${gameJamId}/games`).then(handleResponse),
};

// Games API calls
export const gamesApi = {
  // Get all games
  getAll: () => 
    fetch(`${API_BASE_URL}/public/games`).then(handleResponse),
  
  // Get featured games
  getFeatured: (limit = 6) => 
    fetch(`${API_BASE_URL}/public/games/featured?limit=${limit}`).then(handleResponse),
  
  // Get game by ID
  getById: (id) => 
    fetch(`${API_BASE_URL}/public/games/${id}`).then(handleResponse),
  
  // Search games
  search: (query) => 
    fetch(`${API_BASE_URL}/public/games/search?q=${encodeURIComponent(query)}`).then(handleResponse),
};

// Archive API calls
export const archiveApi = {
  // Get game jam by year and season (returns the specific game jam, not games)
  getGameJamByYearAndSeason: (year, season) => 
    fetch(`${API_BASE_URL}/public/archive/${year}/${season}`).then(handleResponse),
  
  // Get games by year
  getByYear: (year) => 
    fetch(`${API_BASE_URL}/public/archive/${year}`).then(handleResponse),
  
  // Get games by year and season
  getByYearAndSeason: (year, season) => 
    fetch(`${API_BASE_URL}/public/archive/${year}/${season}`).then(handleResponse),
};

// Utility function to process game data from backend
export const processGameData = (game) => {
  // Parse JSON fields if they're strings
  let teamMembers = [];
  let tags = [];
  
  try {
    teamMembers = typeof game.team_members === 'string' 
      ? JSON.parse(game.team_members) 
      : game.team_members || [];
  } catch (e) {
    console.warn('Error parsing team_members for game:', game.id);
  }
  
  try {
    tags = typeof game.tags === 'string' 
      ? JSON.parse(game.tags) 
      : game.tags || [];
  } catch (e) {
    console.warn('Error parsing tags for game:', game.id);
  }
  
  // Determine ranking from tags
  let ranking = null;
  if (tags.includes('rank_1')) ranking = 1;
  else if (tags.includes('rank_2')) ranking = 2;
  else if (tags.includes('rank_3')) ranking = 3;
  
  // Generate thumbnail path based on title
  const thumbnail = `/images/${game.title.toLowerCase().replace(/\s+/g, '-')}.png`;
  
  return {
    ...game,
    team_members: teamMembers,
    tags: tags,
    ranking: ranking,
    thumbnail: thumbnail,
    // Add formatted description for display
    displayDescription: ranking 
      ? `${ranking === 1 ? '1º LUGAR 🥇' : ranking === 2 ? '2º LUGAR 🥈' : '3º LUGAR 🥉'} - ${game.team_name}`
      : game.team_name,
  };
};

// Utility function to sort games (winners first, then by featured status, then by date)
export const sortGames = (games) => {
  return games.sort((a, b) => {
    if (a.ranking && b.ranking) return a.ranking - b.ranking;
    if (a.ranking && !b.ranking) return -1;
    if (!a.ranking && b.ranking) return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
};