"use client";

import { useState, useEffect } from 'react';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [gameJams, setGameJams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    team_name: '',
    team_members: '',
    github_url: '',
    itch_url: '',
    screenshot_urls: '',
    tags: '',
    is_featured: false,
    thumbnail_url: '',
    instructions: '',
    lore: '',
    ranking: '',
    game_jam_id: '',
    // Toggle fields
    show_title: true,
    show_description: true,
    show_team_name: true,
    show_team_members: true,
    show_github_url: true,
    show_itch_url: true,
    show_screenshots: true,
    screenshot_fallback: 'placeholder',
    show_tags: true,
    show_thumbnail: true,
    thumbnail_fallback: 'placeholder',
    show_instructions: true,
    show_lore: true,
    show_ranking: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesRes, jamsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/games`, {
          credentials: 'include',
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams`, {
          credentials: 'include',
        }),
      ]);

      if (gamesRes.ok && jamsRes.ok) {
        const [gamesData, jamsData] = await Promise.all([
          gamesRes.json(),
          jamsRes.json(),
        ]);
        setGames(gamesData);
        setGameJams(jamsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/games/${editing}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/games`;

      // Process form data - convert comma-separated strings to arrays
      const processedData = {
        ...formData,
        team_members: formData.team_members 
          ? formData.team_members.split(',').map(m => m.trim()).filter(Boolean)
          : [],
        screenshot_urls: formData.screenshot_urls
          ? formData.screenshot_urls.split(',').map(u => u.trim()).filter(Boolean)
          : [],
        tags: formData.tags
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        ranking: formData.ranking ? parseInt(formData.ranking) : null,
      };

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        await fetchData();
        resetForm();
        alert(editing ? 'Game updated!' : 'Game created!');
      }
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Failed to save game');
    }
  };

  const handleEdit = (game) => {
    setEditing(game.id);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      team_name: game.team_name || '',
      team_members: Array.isArray(game.team_members) 
        ? game.team_members.join(', ') 
        : '',
      github_url: game.github_url || '',
      itch_url: game.itch_url || '',
      screenshot_urls: Array.isArray(game.screenshot_urls)
        ? game.screenshot_urls.join(', ')
        : '',
      tags: Array.isArray(game.tags)
        ? game.tags.join(', ')
        : '',
      is_featured: game.is_featured || false,
      thumbnail_url: game.thumbnail_url || '',
      instructions: game.instructions || '',
      lore: game.lore || '',
      ranking: game.ranking || '',
      game_jam_id: game.game_jam_id || '',
      // Toggle fields
      show_title: game.show_title !== false,
      show_description: game.show_description !== false,
      show_team_name: game.show_team_name !== false,
      show_team_members: game.show_team_members !== false,
      show_github_url: game.show_github_url !== false,
      show_itch_url: game.show_itch_url !== false,
      show_screenshots: game.show_screenshots !== false,
      screenshot_fallback: game.screenshot_fallback || 'placeholder',
      show_tags: game.show_tags !== false,
      show_thumbnail: game.show_thumbnail !== false,
      thumbnail_fallback: game.thumbnail_fallback || 'placeholder',
      show_instructions: game.show_instructions !== false,
      show_lore: game.show_lore !== false,
      show_ranking: game.show_ranking !== false,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/games/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        await fetchData();
        alert('Game deleted!');
      }
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('Failed to delete game');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      team_name: '',
      team_members: '',
      github_url: '',
      itch_url: '',
      screenshot_urls: '',
      tags: '',
      is_featured: false,
      thumbnail_url: '',
      instructions: '',
      lore: '',
      ranking: '',
      game_jam_id: '',
      // Toggle fields
      show_title: true,
      show_description: true,
      show_team_name: true,
      show_team_members: true,
      show_github_url: true,
      show_itch_url: true,
      show_screenshots: true,
      screenshot_fallback: 'placeholder',
      show_tags: true,
      show_thumbnail: true,
      thumbnail_fallback: 'placeholder',
      show_instructions: true,
      show_lore: true,
      show_ranking: true,
    });
  };

  const getGameJamTitle = (jamId) => {
    const jam = gameJams.find((j) => j.id === jamId);
    return jam ? jam.title : 'Unknown';
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🎯 Games Management</h2>
      </div>

      {/* Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          {editing ? 'Edit Game' : 'Add New Game'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game Jam *
                </label>
                <select
                  value={formData.game_jam_id}
                  onChange={(e) => setFormData({ ...formData, game_jam_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a Game Jam</option>
                  {gameJams.map((jam) => (
                    <option key={jam.id} value={jam.id}>
                      {jam.name || jam.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Team Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Members (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.team_members}
                  onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="John Doe, Jane Smith, ..."
                />
              </div>
            </div>
          </div>

          {/* URLs & Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              URLs & Media
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Itch.io URL
                </label>
                <input
                  type="url"
                  value={formData.itch_url}
                  onChange={(e) => setFormData({ ...formData, itch_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://itch.io/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Screenshot URLs (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.screenshot_urls}
                  onChange={(e) => setFormData({ ...formData, screenshot_urls: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..., https://..."
                />
              </div>
            </div>
          </div>

          {/* Additional Content */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Additional Content
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="puzzle, action, ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ranking
                </label>
                <input
                  type="number"
                  value={formData.ranking}
                  onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="How to play..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lore / Story
                </label>
                <textarea
                  value={formData.lore}
                  onChange={(e) => setFormData({ ...formData, lore: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Game story background..."
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Display Settings
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>⭐ Featured</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_title}
                  onChange={(e) => setFormData({ ...formData, show_title: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Title</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_description}
                  onChange={(e) => setFormData({ ...formData, show_description: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Description</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_team_name}
                  onChange={(e) => setFormData({ ...formData, show_team_name: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Team Name</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_team_members}
                  onChange={(e) => setFormData({ ...formData, show_team_members: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Team Members</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_github_url}
                  onChange={(e) => setFormData({ ...formData, show_github_url: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show GitHub URL</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_itch_url}
                  onChange={(e) => setFormData({ ...formData, show_itch_url: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Itch.io URL</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_thumbnail}
                  onChange={(e) => setFormData({ ...formData, show_thumbnail: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Thumbnail</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_screenshots}
                  onChange={(e) => setFormData({ ...formData, show_screenshots: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Screenshots</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_tags}
                  onChange={(e) => setFormData({ ...formData, show_tags: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Tags</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_instructions}
                  onChange={(e) => setFormData({ ...formData, show_instructions: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Instructions</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_lore}
                  onChange={(e) => setFormData({ ...formData, show_lore: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Lore</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.show_ranking}
                  onChange={(e) => setFormData({ ...formData, show_ranking: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span>Show Ranking</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {editing ? 'Update' : 'Add'} Game
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Game Jam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {game.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {game.team_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {getGameJamTitle(game.game_jam_id)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {game.ranking ? `#${game.ranking}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {game.is_featured ? '⭐' : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 whitespace-nowrap">
                    {game.github_url && (
                      <a
                        href={game.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                        title="GitHub"
                      >
                        🔗
                      </a>
                    )}
                    {game.itch_url && (
                      <a
                        href={game.itch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300"
                        title="Itch.io"
                      >
                        🎮
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(game)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No games found. Add one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
