"use client";

import { useEffect, useMemo, useState } from 'react';
import { SpinWheel, generateWheelColors } from '@/components/SpinWheel';
import { gameJamApi } from '@/utils/api';

const defaultWheelConfig = {
  title: '',
  entries: [],
};

export default function AdminThemeWheel() {
  const [wheelConfig, setWheelConfig] = useState(defaultWheelConfig);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [pointerColor, setPointerColor] = useState('#ef4444');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
  };

  const persistWinner = async (chosen) => {
    try {
      // Get the active game jam automatically
      const activeJam = await gameJamApi.getCurrent();
      if (!activeJam) {
        setError('No active game jam found. Please ensure there is an active jam.');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams/${activeJam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          theme: chosen.text,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save theme');
      }
      const data = await res.json();
      setCurrentTheme(data.theme || chosen.text);
      setStatus(`Saved "${chosen.text}" as the theme for the active jam (${activeJam.name}).`);
    } catch (err) {
      console.error('Failed to save winner', err);
      setError('Failed to save theme to backend.');
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

    // Process file normally
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
              onClick={spin}
              disabled={spinning || slices.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-4 py-2 rounded"
            >
              {spinning ? '🔄 Spinning...' : '🎰 Spin for Theme'}
            </button>
          </div>

          <div className="text-gray-300 space-y-1">
            {winner && (
              <p className="text-green-300">Last spin result: {winner.text} (automatically saved to active jam)</p>
            )}
            {slices.length === 0 && (
              <p className="text-yellow-300">No wheel loaded. Import a .wheel/.json file to start.</p>
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
