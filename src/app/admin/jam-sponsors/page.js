"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminJamSponsorsPage() {
  const { apiFetch } = useAdminAuth();
  const [gameJams, setGameJams] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [selectedJamId, setSelectedJamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    appearance: 'grid',
    columns: 3,
    title: 'SPONSORED BY',
    show_text: true,
    is_circular: false,
    entries: [],
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    async function loadData() {
      try {
        const [jamsRes, sponsorsRes] = await Promise.all([
          fetch(`${apiUrl}/admin/gamejams`, { credentials: 'include' }),
          fetch(`${apiUrl}/sponsors/admin`, { credentials: 'include' }),
        ]);

        if (jamsRes.ok) {
          const jams = await jamsRes.json();
          setGameJams(jams);
          if (jams.length > 0) {
            setSelectedJamId(String(jams[0].id));
          }
        }

        if (sponsorsRes.ok) {
          const allSponsors = await sponsorsRes.json();
          setSponsors(allSponsors.sponsors || []);
        }
      } catch (error) {
        console.error('Failed to load jam sponsor settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [apiUrl]);

  useEffect(() => {
    if (!selectedJamId) return;

    async function loadJamSettings() {
      try {
        const response = await apiFetch(`${apiUrl}/admin/gamejams/${selectedJamId}/sponsor-settings`, {}, 'load jam sponsor settings');
        const data = await response.json();
        setForm({
          appearance: data.sponsor_settings?.appearance || 'grid',
          columns: Number(data.sponsor_settings?.columns || 3),
          title: data.sponsor_settings?.title || 'SPONSORED BY',
          show_text: data.sponsor_settings?.show_text !== false,
          is_circular: !!data.sponsor_settings?.is_circular,
          entries: Array.isArray(data.sponsor_settings?.entries) ? data.sponsor_settings.entries : [],
        });
      } catch (error) {
        console.error('Failed to load selected jam sponsor settings:', error);
        setForm({
          appearance: 'grid',
          columns: 3,
          title: 'SPONSORED BY',
          show_text: true,
          is_circular: false,
          entries: [],
        });
      }
    }

    loadJamSettings();
  }, [apiFetch, apiUrl, selectedJamId]);

  const selectedJam = useMemo(
    () => gameJams.find((jam) => String(jam.id) === String(selectedJamId)) || null,
    [gameJams, selectedJamId]
  );

  const addSponsorEntry = (sponsorId) => {
    if (!sponsorId) return;

    setForm((current) => {
      const exists = current.entries.some((entry) => String(entry.sponsor_id) === String(sponsorId));
      if (exists) return current;

      return {
        ...current,
        entries: [
          ...current.entries,
          {
            sponsor_id: Number(sponsorId),
            display_order: current.entries.length,
            href: '',
            text: '',
            is_active: true,
          },
        ],
      };
    });
  };

  const updateEntry = (index, key, value) => {
    setForm((current) => ({
      ...current,
      entries: current.entries.map((entry, i) => i === index ? { ...entry, [key]: value } : entry),
    }));
  };

  const removeEntry = (index) => {
    setForm((current) => ({
      ...current,
      entries: current.entries.filter((_, i) => i !== index),
    }));
  };

  const saveSettings = async () => {
    if (!selectedJamId) return;

    try {
      setSaving(true);
      const response = await apiFetch(`${apiUrl}/admin/gamejams/${selectedJamId}/sponsor-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsor_settings: form }),
      }, 'save jam sponsor settings');

      if (!response.ok) {
        throw new Error('Unable to save sponsor settings');
      }

      alert('Jam sponsor settings saved.');
    } catch (error) {
      console.error('Failed to save jam sponsor settings:', error);
      alert('Failed to save jam sponsor settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-white">🏁 Jam Sponsors</h2>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Select jam</label>
            <select
              value={selectedJamId}
              onChange={(e) => setSelectedJamId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              {gameJams.map((jam) => (
                <option key={jam.id} value={jam.id}>{jam.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Display layout</label>
            <select
              value={form.appearance}
              onChange={(e) => setForm((current) => ({ ...current, appearance: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="grid">Grid</option>
              <option value="row">Row</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Columns</label>
            <input
              type="number"
              min="1"
              max="6"
              value={form.columns}
              onChange={(e) => setForm((current) => ({ ...current, columns: Number(e.target.value || 1) }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.show_text}
                onChange={(e) => setForm((current) => ({ ...current, show_text: e.target.checked }))}
              />
              Show text
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.is_circular}
                onChange={(e) => setForm((current) => ({ ...current, is_circular: e.target.checked }))}
              />
              Circular logos
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Selected sponsors</h3>
            <div className="flex items-center gap-2">
              <select
                value=""
                onChange={(e) => addSponsorEntry(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">Add sponsor...</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>
                ))}
              </select>
            </div>
          </div>

          {form.entries.length === 0 ? (
            <p className="text-gray-400">No sponsors assigned to this jam yet. Add one to show them on the homepage and archive page.</p>
          ) : (
            <div className="space-y-3">
              {form.entries.map((entry, index) => {
                const sponsorMeta = sponsors.find((sponsor) => String(sponsor.id) === String(entry.sponsor_id));

                return (
                  <div key={`${entry.sponsor_id}-${index}`} className="bg-gray-700/60 rounded-lg border border-gray-600 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{sponsorMeta?.name || `Sponsor #${entry.sponsor_id}`}</strong>
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Link</label>
                        <input
                          type="text"
                          value={entry.href || ''}
                          onChange={(e) => updateEntry(index, 'href', e.target.value)}
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
                          onChange={(e) => updateEntry(index, 'display_order', Number(e.target.value || 0))}
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
                          onChange={(e) => updateEntry(index, 'text', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="Optional text label"
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={entry.is_active !== false}
                            onChange={(e) => updateEntry(index, 'is_active', e.target.checked)}
                          />
                          Active for this jam
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving || !selectedJamId}
            className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save jam sponsorship'}
          </button>
        </div>
      </div>

      {selectedJam && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-sm text-gray-300">
          <strong className="text-white">Current jam:</strong> {selectedJam.name}
        </div>
      )}
    </div>
  );
}
