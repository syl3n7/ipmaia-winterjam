"use client";

import { useEffect, useMemo, useState } from 'react';
import { SpinWheel, generateWheelColors, calculateWinnerIndex, calculateTargetRotation } from '@/components/SpinWheel';

const defaultWheelConfig = {
  title: '',
  entries: [],
};

export default function AdminThemeWheel() {
  const [gameJams, setGameJams] = useState([]);
  const [selectedJamId, setSelectedJamId] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');
  const [wheelConfig, setWheelConfig] = useState(defaultWheelConfig);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [pointerColor, setPointerColor] = useState('#ef4444');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJams = async () => {
      try {
        const res = await fetch('/api/admin/gamejams', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setGameJams(data);
          if (data.length > 0) {
            setSelectedJamId(data[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Failed to fetch game jams', err);
        setError('Failed to load game jams');
      } finally {
        setLoading(false);
      }
    };

    fetchJams();
  }, []);

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

  // Do not auto-load wheel/theme; only populate after file import.

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

  const pickSliceWinner = () => {
    if (slices.length === 0) return null;
    const index = Math.floor(Math.random() * slices.length);
    return { entry: slices[index], index };
  };

  const spin = () => {
    if (spinning || slices.length === 0) return;
    setSpinning(true);
    setStatus('');
    setError('');
    setWinner(null);
    
    // Always use random selection
    const chosenIndex = Math.floor(Math.random() * slices.length);
    
    const finalRotation = calculateTargetRotation(chosenIndex, slices.length, rotation);
    setRotation(finalRotation);
  };

  const persistWinner = async (chosen) => {
    if (!selectedJamId) return;
    try {
      const res = await fetch(`/api/admin/gamejams/${selectedJamId}/theme-wheel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          theme: chosen.text,
          wheelConfig,
          winner: { text: chosen.text, color: chosen.color, weight: chosen.weight },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save theme');
      }
      const data = await res.json();
      setCurrentTheme(data.gameJam.theme || chosen.text);
      setStatus(`Saved "${chosen.text}" as the theme for this jam.`);
    } catch (err) {
      console.error('Failed to save winner', err);
      setError('Failed to save theme to backend.');
    }
  };

  const saveWheelConfig = async () => {
    if (!selectedJamId || !wheelConfig) return;
    setStatus('Saving wheel...');
    try {
      const res = await fetch(`/api/admin/gamejams/${selectedJamId}/theme-wheel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ wheelConfig }),
      });
      if (!res.ok) throw new Error('Failed to save wheel');
      const data = await res.json();
      setStatus('Wheel saved successfully');
      setCurrentTheme(data.gameJam.theme || '');
    } catch (err) {
      console.error('Failed to save wheel:', err);
      setError('Failed to save wheel to backend');
    }
  };

  const loadSavedWheel = async () => {
    if (!selectedJamId) return;
    setStatus('Loading saved wheel...');
    try {
      const res = await fetch(`/api/admin/gamejams/${selectedJamId}/theme-wheel`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load wheel');
      const data = await res.json();
      if (data.wheelConfig && data.wheelConfig.entries && data.wheelConfig.entries.length > 0) {
        const normalized = normalizeConfig(data.wheelConfig);
        // Preserve colors from backend if provided, else assign palette
        const entryTexts = normalized.entries.map((ent) => ent.text);
        const palette = generateWheelColors(entryTexts.length);
        const colored = normalized.entries.map((entry, idx) => ({ ...entry, color: (data.wheelConfig.entries[idx] && data.wheelConfig.entries[idx].color) || palette[idx % palette.length] }));
        setWheelConfig({ ...normalized, entries: colored });
        setWinner(data.lastWinner || null);
        setCurrentTheme(data.theme || '');
        setStatus('Loaded saved wheel');
      } else {
        setStatus('No saved wheel found for this jam');
      }
    } catch (err) {
      console.error('Failed to load saved wheel:', err);
      setError('Failed to load saved wheel');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const valid = file.name.endsWith('.json') || file.name.endsWith('.wheel');
    if (!valid) {
      setError('Please upload a .json or .wheel file');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
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

  const handleSaveThemeOnly = () => {
    if (!winner && currentTheme) {
      setStatus('Theme already saved. Spin to select a new one.');
      return;
    }
    if (winner) {
      persistWinner(winner);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">🎨 Jam Theme Wheel</h2>
          <p className="text-gray-400">Select a jam, import a wheel file, then spin to set its theme.</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-300">Select Game Jam</label>
          <select
            value={selectedJamId}
            onChange={(e) => setSelectedJamId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          >
            {gameJams.map((jam) => (
              <option key={jam.id} value={jam.id}>
                {jam.name} {jam.theme ? `• Current theme: ${jam.theme}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded cursor-pointer">
              📁 Import .wheel / .json
              <input type="file" accept=".json,.wheel" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={handleExport}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              ⬇️ Export JSON (pretty)
            </button>
            <button
              onClick={() => loadSavedWheel()}
              disabled={!selectedJamId}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 px-4 py-2 rounded"
            >
              ⬆️ Load Saved Wheel
            </button>
            <button
              onClick={() => saveWheelConfig()}
              disabled={!selectedJamId || !wheelConfig || !wheelConfig.entries || wheelConfig.entries.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-4 py-2 rounded"
            >
              💾 Save Wheel to Jam
            </button>
            <button
              onClick={spin}
              disabled={spinning || slices.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-4 py-2 rounded"
            >
              {spinning ? '🔄 Spinning...' : '🎰 Spin for Theme'}
            </button>
            <button
              onClick={handleSaveThemeOnly}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
              disabled={!winner}
            >
              💾 Save current theme
            </button>
          </div>

          <div className="text-gray-300 space-y-1">
            <p>
              <span className="font-semibold">Current theme:</span>{' '}
              {currentTheme ? currentTheme : 'No theme saved yet (upload & spin to set).'}
            </p>
            {winner && (
              <p className="text-green-300">Last spin (not yet saved?): {winner.text}</p>
            )}
            {slices.length === 0 && (
              <p className="text-yellow-300">No wheel loaded. Import a .wheel/.json file to start.</p>
            )}
          </div>

          {/* Wheel */}
          <div className="flex justify-center mt-6">
            <SpinWheel
              items={normalizedEntriesForDisplay}
              rotation={rotation}
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
