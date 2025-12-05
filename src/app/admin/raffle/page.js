 'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { SpinWheel, generateWheelColors, calculateTargetRotation, calculateWinnerIndex } from '@/components/SpinWheel';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function RafflePage() {
  const [teams, setTeams] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [removedTeams, setRemovedTeams] = useState([]);
  const wheelRef = useRef(null);
  const [pointerColor, setPointerColor] = useState('#ef4444');
  
  // Import mode
  const [importMode, setImportMode] = useState(false);
  const [jamRaffleMode, setJamRaffleMode] = useState(false);
  const [showJamSelector, setShowJamSelector] = useState(false);
  const [jamSelectorMode, setJamSelectorMode] = useState('spin'); // 'spin' for saving result
  const [gameJams, setGameJams] = useState([]);
  const [selectedGameJam, setSelectedGameJam] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState(null);

  useEffect(() => {
    // Fetch available game jams on component mount
    const fetchGameJams = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams`);
        if (response.ok) {
          const data = await response.json();
          setGameJams(data);
          if (data.length > 0) {
            setSelectedGameJam(data[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching game jams:', error);
      }
    };
    
    fetchGameJams();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('❌ Please upload a CSV file');
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File is too large. Maximum size is 5MB');
      event.target.value = '';
      return;
    }

    // Use different logic based on mode
    if (importMode) {
      // Import mode - show jam selector popup if not selected
      if (!selectedGameJam) {
        setPendingImportFile(file);
        setJamSelectorMode('import');
        setShowJamSelector(true);
        event.target.value = '';
        return;
      }
      importCSVToBackend(file);
    } else {
      // Local mode - parse locally without Game Jam
      parseCSVLocally(file);
    }
    event.target.value = '';
  };

  const importCSVToBackend = async (file) => {
    setImporting(true);
    setImportError('');
    setImportMessage('');

    const formData = new FormData();
    formData.append('csv', file);
    formData.append('gameJamId', selectedGameJam);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/import-teams`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setImportError(data.error || 'Import failed');
        if (data.details) {
          console.error('Import details:', data.details);
        }
      } else {
        setImportMessage(`✅ Successfully imported ${data.summary.successfully_imported} teams!`);
        
        if (data.summary.failed > 0) {
          setImportMessage(prev => prev + `\n⚠️ ${data.summary.failed} teams failed to import`);
        }
        
        // Load teams for raffle
        if (data.results.imported.length > 0) {
          const teamsForRaffle = data.results.imported.map((team, idx) => ({
            id: idx,
            name: team.teamName,
            members: team.members,
            gameId: team.gameId,
            color: team.color || team.raffle_color || null
          }));
          setTeams(teamsForRaffle);
          setRemovedTeams([]);
          setSelectedTeam(null);
          setRotation(0);
          setImportMode(false);
        }

        // Log any warnings
        if (data.summary.warnings > 0) {
          console.warn('Import warnings:', data.results.warnings);
        }
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportError('Failed to connect to server. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const loadTeamsFromJam = async () => {
    if (!selectedGameJam) {
      alert('❌ Please select a Game Jam first');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/gamejams/${selectedGameJam}/games`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const games = await response.json();
      
      // Convert games to team format for raffle
      const teamsForRaffle = games.map((game, idx) => ({
        id: game.id,
        name: game.team_name,
        members: game.team_members || [],
        gameId: game.id,
        color: game.raffle_color || null
      }));

      setTeams(teamsForRaffle);
      setRemovedTeams([]);
      setSelectedTeam(null);
      setRotation(0);
      setImportMessage(`✅ Successfully loaded ${teamsForRaffle.length} teams from ${gameJams.find(j => j.id.toString() === selectedGameJam)?.name || 'selected jam'}`);
      setJamRaffleMode(false);
      setShowJamSelector(false);
    } catch (error) {
      console.error('Error loading teams from jam:', error);
      setImportError('Failed to load teams from the selected game jam. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const parseCSVLocally = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        
        // Don't split by newlines yet - we need to parse properly respecting quotes
        // Parse the entire CSV properly
        const parsedTeams = [];
        const seenNames = new Set();
        
        let currentRow = '';
        let insideQuotes = false;
        const rows = [];
        
        // Parse CSV respecting quoted fields that may contain newlines
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];
          
          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              currentRow += '""';
              i++;
            } else {
              insideQuotes = !insideQuotes;
              currentRow += char;
            }
          } else if (char === '\n' && !insideQuotes) {
            if (currentRow.trim()) {
              rows.push(currentRow);
            }
            currentRow = '';
          } else {
            currentRow += char;
          }
        }
        // Add last row
        if (currentRow.trim()) {
          rows.push(currentRow);
        }
        
        console.log(`📋 Parsed ${rows.length} rows from CSV`);
        
        if (rows.length < 2) {
          alert('❌ CSV file appears to be empty or has no data rows');
          return;
        }
        
        for (let i = 1; i < rows.length; i++) {
          const line = rows[i];
          if (!line.trim()) continue;
          
          // Parse CSV line
          const fields = parseCSVLine(line);
          if (fields.length < 2) continue;
          
          let teamName = fields[1].trim();
          
          // Validation: Team name required and clean
          if (!teamName || teamName === '') {
            console.warn(`Row ${i + 1}: Empty team name, skipping`);
            continue;
          }
          
          // Validation: No HTML or dangerous content
          if (teamName.includes('<') || teamName.includes('>') || teamName.includes('"')) {
            console.warn(`Row ${i + 1}: Team name contains invalid characters, skipping`);
            continue;
          }
          
          // Validation: Duplicate check
          if (seenNames.has(teamName.toLowerCase())) {
            console.warn(`Row ${i + 1}: Duplicate team "${teamName}" found, skipping`);
            continue;
          }
          
          if (teamName.length > 100) {
            teamName = teamName.substring(0, 97) + '...';
          }
          
          seenNames.add(teamName.toLowerCase());
          
          // Get members from 4th column (index 3)
          let members = [];
          if (fields.length > 3) {
            const memberString = fields[3];
            
            // Debug: Log the member string for Escumalha
            if (teamName === 'Escumalha') {
              console.log('🔍 Escumalha member string:', JSON.stringify(memberString));
              console.log('🔍 Contains newlines:', memberString.includes('\n'));
            }
            
            // Split by comma OR newline (some teams use newlines instead of commas)
            members = memberString
              .split(/[,\n\r]+/)  // Split by comma, newline, or carriage return
              .map(m => m.trim())
              .filter(m => {
                // Validation: Member name must exist
                if (m.length === 0) return false;
                
                // Validation: No HTML or dangerous content
                if (m.includes('<') || m.includes('>') || m.includes('"')) {
                  console.warn(`Skipping member with invalid chars: "${m}"`);
                  return false;
                }
                
                // Validation: Max length
                if (m.length > 150) {
                  console.warn(`Member name too long: "${m.substring(0, 30)}..."`);
                  return false;
                }
                
                return true;
              })
              .slice(0, 20);
            
            // Debug: Log parsed members for Escumalha
            if (teamName === 'Escumalha') {
              console.log('🔍 Escumalha parsed members:', members);
            }
          }
          
          // Validation: At least one member required
          if (members.length === 0) {
            console.warn(`Row ${i + 1}: No valid members for "${teamName}", skipping`);
            continue;
          }
          
          parsedTeams.push({
            id: i - 1,
            name: teamName,
            members: members || []
          });
        }

        if (parsedTeams.length === 0) {
          alert('❌ No valid teams found in CSV file. Please check the format.');
          return;
        }

        const palette = generateWheelColors(parsedTeams.length);
        setTeams(parsedTeams.map((t, idx) => ({ ...t, color: palette[idx] })));
        setRemovedTeams([]);
        setSelectedTeam(null);
        setRotation(0);
        
        console.log(`✅ Successfully loaded ${parsedTeams.length} teams (local mode)`);
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('❌ Error parsing CSV file. Please check the file format.');
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const parseCSVLine = (line) => {
    const fields = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote ""
          current += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field only if not inside quotes
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    if (current || fields.length > 0) {
      fields.push(current.trim());
    }

    return fields;
  };

  const spinWheel = () => {
    if (spinning || teams.length === 0) return;

    // For jam raffle mode, show jam selector popup first
    if (jamRaffleMode) {
      setJamSelectorMode('spin');
      setShowJamSelector(true);
      return;
    }

    // For quick raffle (local), spin directly without saving
    performQuickSpin();
  };

  const performQuickSpin = () => {
    setSpinning(true);
    setSelectedTeam(null);

    // Pick a team index at random
    const chosenIndex = Math.floor(Math.random() * teams.length);
    const finalRotation = calculateTargetRotation(chosenIndex, teams.length, rotation);
    setRotation(finalRotation);

    setTimeout(() => {
      const selectedIndex = calculateWinnerIndex(finalRotation, teams.length);
      const selected = teams[selectedIndex];
      setSelectedTeam(selected);
      setPointerColor(selected.color || generateWheelColors(teams.length)[selectedIndex]);
      setSpinning(false);
    }, 6000);
  };

  const performSpin = async () => {
    if (!selectedGameJam) {
      alert('❌ Please select a Game Jam first');
      return;
    }

    setImporting(true);
    setImportError('');
    setSpinning(true);
    setSelectedTeam(null);
    setShowJamSelector(false);

    // Pick a team index at random
    const chosenIndex = Math.floor(Math.random() * teams.length);
    const finalRotation = calculateTargetRotation(chosenIndex, teams.length, rotation);
    setRotation(finalRotation);

    setTimeout(async () => {
      const selectedIndex = calculateWinnerIndex(finalRotation, teams.length);
      const selected = teams[selectedIndex];
      setSelectedTeam(selected);
      setPointerColor(selected.color || generateWheelColors(teams.length)[selectedIndex]);
      setSpinning(false);
      setImporting(false);

      // Save the winner to the selected jam's theme field
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams/${selectedGameJam}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme: selected.name // Save team name as theme
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          setImportError(`Failed to save winner to jam: ${errorData.error || 'Unknown error'}`);
        } else {
          console.log(`✅ Saved winner "${selected.name}" to jam theme`);
        }
      } catch (error) {
        console.error('Error saving winner to jam:', error);
        setImportError('Failed to save winner to jam. Please try again.');
      }
    }, 6000);
  };

  const removeSelectedTeam = () => {
    if (!selectedTeam) return;
    
    setRemovedTeams([...removedTeams, selectedTeam]);
    setTeams(teams.filter(team => team.id !== selectedTeam.id));
    setSelectedTeam(null);
    setRotation(0);
  };

  const resetAll = () => {
    setTeams([]);
    setRemovedTeams([]);
    setSelectedTeam(null);
    setRotation(0);
    setSpinning(false);
  };

  const restoreTeam = (team) => {
    setRemovedTeams(removedTeams.filter(t => t.id !== team.id));
    setTeams([...teams, team]);
  };

  const getWheelColors = (index, total) => {
    const hue = (index * 360) / total;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const teamItems = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    const palette = generateWheelColors(teams.length);
    return teams.map((team, idx) => ({
      ...team,
      text: team.name,
      color: team.color || palette[idx],
    }));
  }, [teams]);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">🎡 Team Raffle Wheel</h1>
          
          {/* Import Mode Toggle */}
          {teams.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setImportMode(false);
                    setJamRaffleMode(false);
                  }}
                  className={`px-6 py-3 rounded-lg transition ${
                    !importMode && !jamRaffleMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  🎲 Quick Raffle (Local)
                </button>
                <button
                  onClick={() => {
                    setImportMode(false);
                    setJamRaffleMode(true);
                  }}
                  className={`px-6 py-3 rounded-lg transition ${
                    jamRaffleMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  🎯 Load from Game Jam
                </button>
                <button
                  onClick={() => {
                    setImportMode(true);
                    setJamRaffleMode(false);
                  }}
                  className={`px-6 py-3 rounded-lg transition ${
                    importMode
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  📥 Import from CSV (Save to DB)
                </button>
              </div>
              
              {/* Quick Raffle CSV Upload */}
              {!importMode && !jamRaffleMode && (
                <div className="text-center">
                  <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg cursor-pointer inline-block transition">
                    📁 Upload CSV for Quick Raffle
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-400 text-sm mt-2">
                    Upload a CSV file to load teams for a local raffle (results are not saved)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Jam Raffle Mode */}
          {jamRaffleMode ? (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">🎯 Load Teams from Game Jam</h2>
              
              {/* Load from Jam Button */}
              <div className="mb-6 text-center">
                <button
                  onClick={() => {
                    setJamSelectorMode('load');
                    setShowJamSelector(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition"
                >
                  🎯 Select Game Jam to Load Teams
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-purple-900 border border-purple-500 rounded-lg p-4 text-purple-200 text-sm">
                <p className="font-bold mb-2">💡 What happens when you load teams:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Teams are loaded temporarily for raffle</li>
                  <li>You can spin the wheel to randomly select winners</li>
                  <li>When spinning, you&apos;ll select which Game Jam to save the result to</li>
                  <li>The winner&apos;s name will be saved as the jam&apos;s theme</li>
                  <li>Data is not modified in the database until you spin</li>
                </ul>
              </div>

              <button
                onClick={() => setJamRaffleMode(false)}
                className="mt-6 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition"
              >
                ← Back
              </button>
            </div>
          ) : importMode ? (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">📥 Import Teams from CSV</h2>
              
              {/* Game Jam Selection */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setJamSelectorMode('import');
                    setShowJamSelector(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
                >
                  🎯 Select Game Jam for Import
                </button>
                {selectedGameJam && (
                  <p className="text-gray-400 text-sm mt-2">
                    ℹ️ Selected: {gameJams.find(j => j.id.toString() === selectedGameJam)?.name || 'Unknown Jam'}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className={`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg cursor-pointer inline-block transition ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  📁 {importing ? 'Importing...' : 'Upload CSV'}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Messages */}
              {importError && (
                <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-4 text-red-200">
                  <p className="font-bold">❌ Import Error</p>
                  <p className="text-sm mt-1">{importError}</p>
                </div>
              )}

              {importMessage && (
                <div className="bg-green-900 border border-green-500 rounded-lg p-4 mb-4 text-green-200 whitespace-pre-wrap">
                  <p className="font-bold">✅ Import Success</p>
                  <p className="text-sm mt-1">{importMessage}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-900 border border-blue-500 rounded-lg p-4 text-blue-200 text-sm">
                <p className="font-bold mb-2">💡 What happens when you import:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload your CSV file first</li>
                  <li>Select which Game Jam to import teams to</li>
                  <li>Teams are created as games in the selected Game Jam</li>
                  <li>All registration details are stored (emails, members, dietary info, etc.)</li>
                  <li>You can then edit game titles, add descriptions, and fill in actual game information</li>
                  <li>Game names are initially set to &quot;[Team Name] - [Pending Game Name]&quot;</li>
                  <li>Teams are validated for required fields and correct format</li>
                </ul>
              </div>

              <button
                onClick={() => setImportMode(false)}
                className="mt-6 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition"
              >
                ← Back
              </button>
            </div>
          ) : teams.length > 0 ? (
            <>
              {/* Raffle Mode Controls */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <div>
                    <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg cursor-pointer inline-block transition">
                      📁 Upload CSV (Local)
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <button
                    onClick={spinWheel}
                    disabled={spinning || teams.length === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition"
                  >
                    {spinning ? '🔄 Spinning...' : '🎲 Spin the Wheel!'}
                  </button>

                  {selectedTeam && (
                    <button
                      onClick={removeSelectedTeam}
                      className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition"
                    >
                      ❌ Remove Winner
                    </button>
                  )}

                  <button
                    onClick={resetAll}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition"
                  >
                    🔄 Reset All
                  </button>

                  <button
                    onClick={() => setImportMode(true)}
                    className="bg-green-700 hover:bg-green-800 px-6 py-3 rounded-lg transition text-sm"
                  >
                    📥 Import & Save
                  </button>

                  <button
                    onClick={() => {
                      setJamRaffleMode(true);
                      setImportMode(false);
                    }}
                    className="bg-purple-700 hover:bg-purple-800 px-6 py-3 rounded-lg transition text-sm"
                  >
                    🎯 Load from Jam
                  </button>
                </div>

                <div className="text-center mt-4 text-gray-400">
                  {teams.length} team{teams.length !== 1 ? 's' : ''} remaining
                  {removedTeams.length > 0 && ` • ${removedTeams.length} removed`}
                </div>
              </div>

              {/* Winner Display */}
              {selectedTeam && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-8 mb-8 text-center animate-pulse">
                  <h2 className="text-3xl font-bold mb-2">🎉 Winner! 🎉</h2>
                  <p className="text-5xl font-bold">{selectedTeam.name}</p>
                  {selectedTeam.members && selectedTeam.members.length > 0 && (
                    <p className="text-lg mt-4 text-gray-800">
                      Team: {selectedTeam.members.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Wheel Container */}
              {teams.length > 0 && (
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <SpinWheel
                      items={teamItems}
                      rotation={rotation}
                      spinning={spinning}
                      pointerColor={pointerColor}
                      size={600}
                    />
                  </div>
                </div>
              )}

              {/* Teams Lists */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Active Teams */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">📋 Active Teams</h2>
                  {teams.length === 0 ? (
                    <p className="text-gray-400">No teams loaded. Upload a CSV file, use Import mode, or Load from Game Jam to load teams!</p>
                  ) : (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {teams.map((team) => (
                        <li
                          key={team.id}
                          className={`p-3 rounded ${
                            selectedTeam?.id === team.id
                              ? 'bg-yellow-600'
                              : 'bg-gray-700'
                          }`}
                        >
                          <div className="font-semibold">{team.name}</div>
                          {team.members && team.members.length > 0 && (
                            <div className="text-sm text-gray-300">
                              {team.members.length} members: {team.members.join(', ')}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Removed Teams */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">🏆 Winners / Removed</h2>
                  {removedTeams.length === 0 ? (
                    <p className="text-gray-400">No teams removed yet.</p>
                  ) : (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {removedTeams.map((team) => (
                        <li
                          key={team.id}
                          className="p-3 rounded bg-gray-700 flex justify-between items-start gap-2"
                        >
                          <div className="flex-1">
                            <div className="font-semibold">{team.name}</div>
                            {team.members && team.members.length > 0 && (
                              <div className="text-sm text-gray-300">
                                {team.members.join(', ')}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => restoreTeam(team)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition whitespace-nowrap"
                          >
                            Restore
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {/* Jam Selector Popup */}
          {showJamSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-center">
                  🎯 {jamSelectorMode === 'import' ? 'Select Game Jam for Import' : jamSelectorMode === 'spin' ? 'Select Game Jam for Spin Result' : 'Select Game Jam'}
                </h3>
                
                {/* Game Jam Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Choose a Game Jam</label>
                  <select
                    value={selectedGameJam}
                    onChange={(e) => setSelectedGameJam(e.target.value)}
                    disabled={gameJams.length === 0 || importing}
                    className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gameJams.length === 0 ? (
                      <option>No Game Jams available</option>
                    ) : (
                      gameJams.map((jam) => (
                        <option key={jam.id} value={jam.id}>
                          {jam.name} - {jam.theme}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-gray-400 text-sm mt-2">
                    ℹ️ {jamSelectorMode === 'import' 
                      ? 'Teams will be imported and saved to the database as game entries' 
                      : jamSelectorMode === 'spin'
                      ? 'The spin result will be saved as the theme for this Game Jam'
                      : 'Teams will be loaded from the selected Game Jam'}
                  </p>
                </div>

                {/* Messages */}
                {importError && (
                  <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-4 text-red-200">
                    <p className="font-bold">❌ {jamSelectorMode === 'import' ? 'Import' : jamSelectorMode === 'spin' ? 'Spin' : 'Load'} Error</p>
                    <p className="text-sm mt-1">{importError}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJamSelector(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={jamSelectorMode === 'import' ? () => {
                      // For import mode, import the pending file
                      if (pendingImportFile) {
                        importCSVToBackend(pendingImportFile);
                        setPendingImportFile(null);
                      }
                      setShowJamSelector(false);
                    } : jamSelectorMode === 'spin' ? performSpin : loadTeamsFromJam}
                    disabled={importing || !selectedGameJam}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      jamSelectorMode === 'import'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : jamSelectorMode === 'spin'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                  >
                    {jamSelectorMode === 'import' 
                      ? '✅ Select Jam' 
                      : jamSelectorMode === 'spin'
                      ? '🎲 Spin the Wheel!'
                      : (importing ? '🔄 Loading...' : '🎯 Load Teams')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>💡 Load teams first, then select a Game Jam when spinning. The winner will be saved as the jam&apos;s theme!</p>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}