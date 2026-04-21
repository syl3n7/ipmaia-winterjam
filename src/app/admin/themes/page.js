"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { SpinWheel, generateWheelColors } from '@/components/SpinWheel';
import { API_BASE_URL } from '@/utils/api';

const defaultWheelConfig = {
  title: '',
  entries: [],
};

export default function AdminThemeWheel() {
  const { apiFetch } = useAdminAuth();
  const [wheelConfig, setWheelConfig] = useState(defaultWheelConfig);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('');
  const [pointerColor, setPointerColor] = useState('#ef4444');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [themesEnabled, setThemesEnabled] = useState(false);
  const [checkingEnabled, setCheckingEnabled] = useState(true);

  // Game jam selector
  const [gameJams, setGameJams] = useState([]);
  const [selectedJamId, setSelectedJamId] = useState('');
  const [loadingJam, setLoadingJam] = useState(false);

  useEffect(() => {
    const checkThemesEnabled = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/frontpage/admin/settings`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const settingsBySection = await response.json();
          const allSettings = Object.values(settingsBySection).flat();
          const themesSetting = allSettings.find(s => s.setting_key === 'enable_jam_themes');
          setThemesEnabled(themesSetting ? themesSetting.setting_value === 'true' : false);
        } else {
          setThemesEnabled(false);
        }
      } catch (error) {
        console.error('Failed to check themes status:', error);
        setThemesEnabled(false);
      } finally {
        setCheckingEnabled(false);
      }
    };

    const fetchGameJams = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/admin/gamejams`, {}, 'fetch game jams');
        const data = await response.json();
        setGameJams(data);
        if (data.length > 0) {
          setSelectedJamId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching game jams:', err);
      }
    };

    checkThemesEnabled();
    fetchGameJams();
  }, []);

  // Load saved wheel config whenever selected jam changes
  useEffect(() => {
    if (!selectedJamId) return;

    const loadJamWheelConfig = async () => {
      setLoadingJam(true);
      setStatus('');
      setError('');
      setWinner(null);
      setCurrentTheme('');

      try {
        const response = await apiFetch(
          `${API_BASE_URL}/admin/gamejams/${selectedJamId}/theme-wheel`,
          {},
          'load theme wheel'
        );
        const data = await response.json();

        if (data.wheelConfig && data.wheelConfig.entries && data.wheelConfig.entries.length > 0) {
          const normalized = normalizeConfig(data.wheelConfig);
          setWheelConfig(normalized);
          setStatus(`Loaded saved wheel (${normalized.entries.length} entries) for "${data.name}".`);
        } else {
          setWheelConfig(defaultWheelConfig);
          setStatus('');
        }

        if (data.theme) {
          setCurrentTheme(data.theme);
        }
      } catch (err) {
        console.error('Failed to load theme wheel for jam', err);
        setWheelConfig(defaultWheelConfig);
      } finally {
        setLoadingJam(false);
      }
    };

    loadJamWheelConfig();
  }, [selectedJamId]);

  function normalizeConfig(config) {
    const entries = Array.isArray(config?.entries) ? config.entries : [];
    const mapped = entries.map((entry, idx) => ({
      text: entry.text || `Entry ${idx + 1}`,
      weight: Number(entry.weight) || 1,
      enabled: entry.enabled !== false,
    }));
    
    return {
      ...defaultWheelConfig,
      ...config,
      entries: mapped,
    };
  }

  const enabledEntries = useMemo(
    () => (wheelConfig.entries || []).filter((entry) => entry.enabled !== false),
    [wheelConfig]
  );

  // Expand weighted entries into visual slices for accurate geometry & selection
  const slices = useMemo(() => {
    const result = [];
    enabledEntries.forEach((entry) => {
      const count = Math.max(1, Math.round(Number(entry.weight) || 1));
      for (let i = 0; i < count; i++) {
        result.push({ ...entry });
      }
    });

    // Unique entries mapping to colors - one color per unique entry
    const unique = enabledEntries.map((e) => e.text);
    const palette = generateWheelColors(unique.length);
    const entryColorMap = new Map();
    unique.forEach((text, idx) => entryColorMap.set(text, palette[idx]));

    // Apply the color per slice based on the entry it belongs to
    const coloredSlices = result.map((entry) => ({ ...entry, color: entryColorMap.get(entry.text) || '#999' }));
    
    // Randomize the order of slices for each spin/load
    for (let i = coloredSlices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coloredSlices[i], coloredSlices[j]] = [coloredSlices[j], coloredSlices[i]];
    }
    
    return coloredSlices;
  }, [enabledEntries]);

  // Handle when pointer enters a new slice
  const handleSliceChange = (slice) => {
    setPointerColor(slice.color);
  };

  // Handle when spinning stops and winner is determined
  const handleSpinComplete = (winningSlice) => {
    setWinner(winningSlice);
    persistWinner(winningSlice);
  };

  // Handle when spin animation ends
  const handleSpinEnd = () => {
    setSpinning(false);
  };

  const normalizedEntriesForDisplay = slices.length > 0 ? slices : [{ text: 'Add entries', color: '#555' }];

  const spin = () => {
    if (spinning || slices.length === 0) return;

    setSpinning(true);
    setStatus('');
    setError('');
    setWinner(null);
  };

  const persistWinner = async (chosen) => {
    if (!selectedJamId) {
      setError('No game jam selected. Please select a jam first.');
      return;
    }

    const jam = gameJams.find(j => j.id.toString() === selectedJamId);

    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/gamejams/${selectedJamId}/theme-wheel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // `theme` updates the jam's official theme field; `winner` records the last spin result
        body: JSON.stringify({ theme: chosen.text, winner: chosen.text }),
      }, 'persist theme');

      const data = await res.json();
      setCurrentTheme(data.gameJam?.theme || chosen.text);
      setStatus(`Saved "${chosen.text}" as the theme for "${jam?.name || 'selected jam'}".`);
    } catch (err) {
      console.error('Failed to save winner', err);
      setError('Failed to save theme to backend.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const valid = file.name.endsWith('.json') || file.name.endsWith('.wheel');
    if (!valid) {
      setError('Please upload a .json or .wheel file');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const normalized = normalizeConfig(parsed);
        // Apply color mapping per entry and persist in wheelConfig.entries
        const entryTexts = normalized.entries.map((ent) => ent.text);
        const palette = generateWheelColors(entryTexts.length);
        const coloredEntries = normalized.entries.map((entry, idx) => ({
          ...entry,
          color: entry.color || palette[idx % palette.length]
        }));
        const coloredConfig = { ...normalized, entries: coloredEntries };
        setWheelConfig(coloredConfig);
        setWinner(null);
        setCurrentTheme('');
        setStatus(`Loaded ${normalized.entries.length} entries from file.`);
        setError('');

        // Persist wheel config to the selected jam
        if (selectedJamId) {
          try {
            await apiFetch(`${API_BASE_URL}/admin/gamejams/${selectedJamId}/theme-wheel`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wheelConfig: coloredConfig }),
            }, 'save wheel config');
            const jam = gameJams.find(j => j.id.toString() === selectedJamId);
            setStatus(`Loaded ${normalized.entries.length} entries from file and saved to "${jam?.name || 'selected jam'}".`);
          } catch (saveErr) {
            console.error('Failed to save wheel config to backend', saveErr);
            setError('Wheel loaded locally, but failed to save to backend.');
          }
        }
      } catch (err) {
        console.error('Failed to parse file', err);
        setError('Failed to parse file. Ensure it is valid JSON.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const handleExport = () => {
    if (!wheelConfig.entries || wheelConfig.entries.length === 0) {
      setError('Nothing to export. Import a wheel first.');
      return;
    }
    const payload = JSON.stringify(wheelConfig, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wheelConfig.title || 'jam-themes'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (checkingEnabled) {
    return <div className="text-white">Loading...</div>;
  }

  if (!themesEnabled) {
    return (
      <div className="space-y-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">🎨 Jam Theme Wheel</h2>
            <p className="text-gray-400">Select a jam, import a wheel file, then spin to set its theme.</p>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Jam Themes Feature Disabled</h3>
            <p className="text-gray-400">
              The jam themes feature is currently disabled. Enable it from the Front Page settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">🎨 Jam Theme Wheel</h2>
          <p className="text-gray-400">Select a jam, import a wheel file, then spin to set its theme.</p>
        </div>
      </div>

      {/* Game Jam Selector */}
      <div className="bg-gray-800 border border-gray-700 rounded p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-300 whitespace-nowrap">🎮 Game Jam:</label>
          <select
            value={selectedJamId}
            onChange={(e) => setSelectedJamId(e.target.value)}
            disabled={loadingJam || gameJams.length === 0}
            className="flex-1 min-w-[200px] bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameJams.length === 0 ? (
              <option value="">No game jams available</option>
            ) : (
              gameJams.map((jam) => (
                <option key={jam.id} value={jam.id.toString()}>
                  {jam.name}{jam.theme ? ` — ${jam.theme}` : ''}
                </option>
              ))
            )}
          </select>
          {currentTheme && (
            <span className="text-sm text-purple-300 font-medium">
              Current theme: <span className="text-white font-bold">{currentTheme}</span>
            </span>
          )}
          {loadingJam && <span className="text-sm text-gray-400">🔄 Loading...</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <label className={`px-4 py-2 rounded cursor-pointer transition ${selectedJamId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}>
              📁 Import .wheel / .json
              <input
                type="file"
                accept=".json,.wheel"
                className="hidden"
                onChange={handleFileUpload}
                disabled={!selectedJamId}
              />
            </label>
            <button
              onClick={handleExport}
              disabled={enabledEntries.length === 0}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded"
            >
              ⬇️ Export JSON
            </button>
            <button
              onClick={spin}
              disabled={spinning || slices.length === 0 || !selectedJamId}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded"
            >
              {spinning ? '🔄 Spinning...' : '🎰 Spin for Theme'}
            </button>
          </div>

          <div className="text-gray-300 space-y-1">
            {winner && (
              <p className="text-green-300">
                Last spin result: <span className="font-bold text-white">{winner.text}</span>
                {selectedJamId && (
                  <span className="text-gray-400"> — saved to &quot;{gameJams.find(j => j.id.toString() === selectedJamId)?.name}&quot;</span>
                )}
              </p>
            )}
            {slices.length === 0 && (
              <p className="text-yellow-300">No wheel loaded. Import a .wheel/.json file to start.</p>
            )}
            {!selectedJamId && (
              <p className="text-orange-300">⚠️ Select a game jam above before spinning.</p>
            )}
          </div>

          {/* Wheel */}
          <div className="flex justify-center mt-6">
            <SpinWheel
              items={normalizedEntriesForDisplay}
              spinning={spinning}
              pointerColor={pointerColor}
              onSliceChange={handleSliceChange}
              onSpinComplete={handleSpinComplete}
              onSpinEnd={handleSpinEnd}
              size={520}
              debug={true}
            />
          </div>

          {status && <div className="text-green-300">{status}</div>}
          {error && <div className="text-red-300">{error}</div>}
        </div>

        {/* Entries list */}
        <div className="bg-gray-800 border border-gray-700 rounded p-6 space-y-4">
          <h3 className="text-xl font-semibold">Entries ({enabledEntries.length})</h3>
          <div className="max-h-[520px] overflow-y-auto space-y-2">
            {enabledEntries.length === 0 && <p className="text-gray-400">Import a wheel to get started.</p>}
            {enabledEntries.map((entry, idx) => (
              <div key={`${entry.text}-${idx}`} className="p-3 rounded bg-gray-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{entry.text}</div>
                  <div className="text-sm text-gray-300">Weight: {entry.weight || 1}</div>
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-900"
                  style={{ backgroundColor: entry.color }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
