"use client";

import { useState, useEffect } from 'react';

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tier: '',
    website_url: '',
    description: '',
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sponsors/admin`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setSponsors(data.sponsors || []);
      } else {
        console.error('Failed to fetch sponsors:', response.status, response.statusText);
        alert(`Failed to load sponsors: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch sponsors:', error);
      alert('Failed to load sponsors. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (sponsorId) => {
    if (!logoFile) return null;

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sponsors/upload-logo`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.filename;
      }
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let logo_filename = formData.logo_filename;

      // Upload logo first if new file selected
      if (logoFile) {
        const filename = await handleLogoUpload();
        if (filename) {
          logo_filename = filename;
        }
      }

      const sponsorData = {
        ...formData,
        logo_filename,
      };

      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_URL}/sponsors/${editing}`
        : `${process.env.NEXT_PUBLIC_API_URL}/sponsors`;

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sponsorData),
      });

      if (response.ok) {
        await fetchSponsors();
        resetForm();
        alert(editing ? 'Sponsor updated!' : 'Sponsor created!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to save sponsor: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save sponsor:', error);
      alert('Failed to save sponsor');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (sponsor) => {
    setEditing(sponsor.id);
    setShowForm(true);
    setFormData({
      name: sponsor.name,
      tier: sponsor.tier,
      website_url: sponsor.website_url || '',
      description: sponsor.description || '',
      is_active: sponsor.is_active,
      logo_filename: sponsor.logo_filename || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sponsors/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        await fetchSponsors();
        alert('Sponsor deleted!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete sponsor: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete sponsor:', error);
      alert('Failed to delete sponsor');
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setLogoFile(null);
    setFormData({
      name: '',
      tier: '',
      website_url: '',
      description: '',
      is_active: true,
    });
  };

  const getTierLabel = (tier) => {
    const tiers = {
      platinum: '🏆 Platinum',
      gold: '⭐ Gold',
      silver: '🥈 Silver',
      bronze: '🥉 Bronze',
    };
    return tiers[tier] || tier;
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🎪 Sponsors Management</h2>
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-semibold"
          >
            ➕ Add New Sponsor
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editing ? 'Edit Sponsor' : 'Add New Sponsor'}
          </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tier *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select tier...</option>
                <option value="platinum">🏆 Platinum</option>
                <option value="gold">⭐ Gold</option>
                <option value="silver">🥈 Silver</option>
                <option value="bronze">🥉 Bronze</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo Image
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="w-full px-4 py-2 bg-gray-700 border-2 border-dashed border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
              <small className="text-gray-400">JPG, PNG, WebP, SVG. Max 2MB</small>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-300">Active</label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : editing ? 'Update' : 'Create'} Sponsor
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
      )}

      {/* List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sponsors.map((sponsor) => (
                <tr key={sponsor.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    {sponsor.logo_filename ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/sponsors/logo/${sponsor.logo_filename}`}
                        alt={sponsor.name}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-600 rounded flex items-center justify-center text-gray-400">
                        No Logo
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {sponsor.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {getTierLabel(sponsor.tier)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        sponsor.is_active
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {sponsor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {sponsor.website_url && (
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                      >
                        🔗 Visit
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(sponsor)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No sponsors found. Add one to get started!
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
