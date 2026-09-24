"use client";

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { API_BASE_URL } from '@/utils/api';

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [gameJams, setGameJams] = useState([]);
  const [selectedJamId, setSelectedJamId] = useState('');
  const [jamEntries, setJamEntries] = useState([]);
  const [jamDisplayConfig, setJamDisplayConfig] = useState({
    appearance: 'grid',
    columns: 3,
    title: 'SPONSORED BY',
    show_text: true,
    is_circular: false,
  });
  const [savingJamAssignments, setSavingJamAssignments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tier: '',
    logo_url: '',
    website_url: '',
    description: '',
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const { handleApiResponse, apiFetch } = useAdminAuth();

  const fetchSponsors = useCallback(async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/sponsors/admin`, {}, 'fetch sponsors');
      const data = await response.json();
      setSponsors(data.sponsors || []);
    } catch (error) {
      console.error('Failed to fetch sponsors:', error);
      alert('Failed to load sponsors. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  useEffect(() => {
    const loadGameJams = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/admin/gamejams`, {}, 'fetch game jams');
        const data = await response.json();
        const jams = Array.isArray(data) ? data : [];
        setGameJams(jams);
        if (!selectedJamId && jams[0]) {
          setSelectedJamId(String(jams[0].id));
        }
      } catch (error) {
        console.error('Failed to load game jams for sponsor assignments:', error);
      }
    };

    loadGameJams();
  }, [apiFetch, selectedJamId]);

  useEffect(() => {
    if (!selectedJamId) return;

    const loadJamAssignments = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/admin/gamejams/${selectedJamId}/sponsor-settings`, {}, 'load jam sponsor assignments');
        const data = await response.json();
        const sponsorSettings = data?.sponsor_settings || {};
        setJamEntries(Array.isArray(sponsorSettings.entries) ? sponsorSettings.entries : []);
        setJamDisplayConfig({
          appearance: sponsorSettings.appearance || 'grid',
          columns: Number(sponsorSettings.columns || 3),
          title: sponsorSettings.title || 'SPONSORED BY',
          show_text: sponsorSettings.show_text !== false,
          is_circular: !!sponsorSettings.is_circular,
        });
      } catch (error) {
        console.error('Failed to load jam sponsor assignments:', error);
        setJamEntries([]);
        setJamDisplayConfig({
          appearance: 'grid',
          columns: 3,
          title: 'SPONSORED BY',
          show_text: true,
          is_circular: false,
        });
      }
    };

    loadJamAssignments();
  }, [apiFetch, selectedJamId]);

  const addSponsorToJam = (sponsorId) => {
    if (!sponsorId) return;

    setJamEntries((current) => {
      const exists = current.some((entry) => String(entry.sponsor_id) === String(sponsorId));
      if (exists) return current;

      return [
        ...current,
        {
          sponsor_id: Number(sponsorId),
          display_order: current.length,
          href: '',
          text: '',
          is_active: true,
        },
      ];
    });
  };

  const updateJamEntry = (index, key, value) => {
    setJamEntries((current) => current.map((entry, i) => i === index ? { ...entry, [key]: value } : entry));
  };

  const removeJamEntry = (index) => {
    setJamEntries((current) => current.filter((_, i) => i !== index));
  };

  const saveJamAssignments = async () => {
    if (!selectedJamId) return;

    try {
      setSavingJamAssignments(true);
      await apiFetch(`${API_BASE_URL}/admin/gamejams/${selectedJamId}/sponsor-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsor_settings: {
            appearance: jamDisplayConfig.appearance,
            columns: Number(jamDisplayConfig.columns || 3),
            title: jamDisplayConfig.title || 'SPONSORED BY',
            show_text: jamDisplayConfig.show_text !== false,
            is_circular: !!jamDisplayConfig.is_circular,
            entries: jamEntries,
          },
        }),
      }, 'save jam sponsor assignments');

      alert('Jam sponsor assignments saved.');
    } catch (error) {
      console.error('Failed to save jam sponsor assignments:', error);
      alert('Failed to save jam sponsor assignments.');
    } finally {
      setSavingJamAssignments(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return null;

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await apiFetch(`${API_BASE_URL}/sponsors/upload-logo`, {
        method: 'POST',
        body: formData,
      }, 'upload sponsor logo');

      const data = await response.json();
      return data.filename;
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let logo_filename = formData.logo_filename || null;

      if (logoFile) {
        const filename = await handleLogoUpload();
        if (filename) {
          logo_filename = filename;
        }
      } else if (formData.logo_url && formData.logo_url.trim()) {
        logo_filename = formData.logo_url.trim();
      }

      const sponsorData = {
        ...formData,
        logo_filename,
      };

      const url = editing
        ? `${API_BASE_URL}/sponsors/${editing}`
        : `${API_BASE_URL}/sponsors`;

      const response = await apiFetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsorData),
      }, editing ? 'update sponsor' : 'create sponsor');

      await fetchSponsors();
      resetForm();
      alert(editing ? 'Sponsor updated!' : 'Sponsor created!');
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
    const isRemoteLogo = typeof sponsor.logo_filename === 'string' && /^(https?:\/\/|data:)/i.test(sponsor.logo_filename);
    setFormData({
      name: sponsor.name,
      tier: sponsor.tier,
      logo_url: isRemoteLogo ? sponsor.logo_filename : '',
      website_url: sponsor.website_url || '',
      description: sponsor.description || '',
      is_active: sponsor.is_active,
      logo_filename: sponsor.logo_filename || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;

    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsors/${id}`, {
        method: 'DELETE',
      }, 'delete sponsor');

      await fetchSponsors();
      alert('Sponsor deleted!');
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
      logo_url: '',
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

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">🎯 Jam assignments</h3>
            <p className="text-sm text-gray-400">Pick one sponsor catalog entry per jam and decide which ones show on that jam’s archive/homepage.</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="text-sm text-gray-300">Jam</label>
            <select
              value={selectedJamId}
              onChange={(e) => setSelectedJamId(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              {gameJams.map((jam) => (
                <option key={jam.id} value={jam.id}>{jam.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-sm text-gray-300 mb-2">Layout</label>
            <select
              value={jamDisplayConfig.appearance}
              onChange={(e) => setJamDisplayConfig((current) => ({ ...current, appearance: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="grid">Grid</option>
              <option value="row">Row</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Columns</label>
            <input
              type="number"
              min="1"
              max="6"
              value={jamDisplayConfig.columns}
              onChange={(e) => setJamDisplayConfig((current) => ({ ...current, columns: Number(e.target.value || 1) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={jamDisplayConfig.title}
              onChange={(e) => setJamDisplayConfig((current) => ({ ...current, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div className="flex items-end gap-4 pt-6">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={jamDisplayConfig.show_text}
                onChange={(e) => setJamDisplayConfig((current) => ({ ...current, show_text: e.target.checked }))}
              />
              Show text
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={jamDisplayConfig.is_circular}
                onChange={(e) => setJamDisplayConfig((current) => ({ ...current, is_circular: e.target.checked }))}
              />
              Circular
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <select
            value=""
            onChange={(e) => addSponsorToJam(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="">Add sponsor to selected jam...</option>
            {sponsors.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={saveJamAssignments}
            disabled={savingJamAssignments || !selectedJamId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors"
          >
            {savingJamAssignments ? 'Saving...' : 'Save jam sponsors'}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {jamEntries.length === 0 ? (
            <p className="text-gray-400">This jam has no assigned sponsors yet. Add one above.</p>
          ) : (
            jamEntries.map((entry, index) => {
              const sponsorMeta = sponsors.find((sponsor) => String(sponsor.id) === String(entry.sponsor_id));
              return (
                <div key={`${entry.sponsor_id}-${index}`} className="bg-gray-700/50 rounded border border-gray-600 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">{sponsorMeta?.name || `Sponsor #${entry.sponsor_id}`}</strong>
                    <button type="button" onClick={() => removeJamEntry(index)} className="text-red-300 hover:text-red-200">Remove</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Link</label>
                      <input
                        type="text"
                        value={entry.href || ''}
                        onChange={(e) => updateJamEntry(index, 'href', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Display order</label>
                      <input
                        type="number"
                        min="0"
                        value={entry.display_order ?? index}
                        onChange={(e) => updateJamEntry(index, 'display_order', Number(e.target.value || 0))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Text override</label>
                      <input
                        type="text"
                        value={entry.text || ''}
                        onChange={(e) => updateJamEntry(index, 'text', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                        placeholder="Optional label"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={entry.is_active !== false}
                          onChange={(e) => updateJamEntry(index, 'is_active', e.target.checked)}
                        />
                        Active for this jam
                      </label>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
              <small className="text-gray-400">Upload a file or use the URL below. JPG, PNG, WebP, SVG. Max 2MB</small>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
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
                      <Image
                        src={/^(https?:\/\/|data:)/i.test(sponsor.logo_filename) ? sponsor.logo_filename : `${API_BASE_URL}/sponsors/logo/${sponsor.logo_filename}`}
                        alt={sponsor.name}
                        width={48}
                        height={48}
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
