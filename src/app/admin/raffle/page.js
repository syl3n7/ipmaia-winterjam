 'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { SpinWheel, generateWheelColors } from '@/components/SpinWheel';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function RafflePage() {
  const [teams, setTeams] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [winners, setWinners] = useState([]);
  const wheelRef = useRef(null);
  const [pointerColor, setPointerColor] = useState('#ef4444');
  
  // Import mode
  const [jamRaffleMode, setJamRaffleMode] = useState(false);
  const [showJamSelector, setShowJamSelector] = useState(false);
  const [jamSelectorMode, setJamSelectorMode] = useState('spin'); // 'spin' for saving result
  const [gameJams, setGameJams] = useState([]);
  const [selectedGameJam, setSelectedGameJam] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [raffleEnabled, setRaffleEnabled] = useState(false);
  const [checkingEnabled, setCheckingEnabled] = useState(true);

  useEffect(() => {
    // Check if raffle is enabled
    const checkRaffleEnabled = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/frontpage/admin/settings`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const settingsBySection = await response.json();
          const allSettings = Object.values(settingsBySection).flat();
          const raffleSetting = allSettings.find(s => s.setting_key === 'enable_raffle_wheel');
          setRaffleEnabled(raffleSetting ? raffleSetting.setting_value === 'true' : false);
        } else {
          setRaffleEnabled(false);
        }
      } catch (error) {
        console.error('Failed to check raffle status:', error);
        setRaffleEnabled(false);
      } finally {
        setCheckingEnabled(false);
      }
    };

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
    
    checkRaffleEnabled();
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

    // Set pending file for import
    setPendingImportFile(file);
    event.target.value = '';
  };

  const handleWheelFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.wheel')) {
      alert('❌ Please upload a .wheel file');
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File is too large. Maximum size is 5MB');
      event.target.value = '';
      return;
    }

    // Parse the wheel file immediately
    parseWheelFile(file);
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
        
        // Add imported teams to existing teams
        if (data.results.imported.length > 0) {
          const teamsForRaffle = data.results.imported.map((team, idx) => ({
            id: `imported-${Date.now()}-${idx}`,
            name: team.teamName,
            members: team.members,
            gameId: team.gameId,
            color: team.color || team.raffle_color || null,
            fromImport: true
          }));
          setTeams(prevTeams => [...prevTeams, ...teamsForRaffle]);
          setWinners([]);
          
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
        id: `jam-${selectedGameJam}-${game.id}`,
        name: game.team_name,
        members: game.team_members || [],
        gameId: game.id,
        jamId: selectedGameJam,
        color: game.raffle_color || null,
        fromJam: true
      }));

      // Add jam teams to existing teams (don't replace)
      setTeams(prevTeams => [...prevTeams, ...teamsForRaffle]);
      setWinners([]);
      setImportMessage(`✅ Successfully added ${teamsForRaffle.length} teams from ${gameJams.find(j => j.id.toString() === selectedGameJam)?.name || 'selected jam'}`);
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
        
        // Check file size to prevent DoS
        const MAX_CSV_SIZE = 5 * 1024 * 1024; // 5MB
        if (text.length > MAX_CSV_SIZE) {
          alert(`❌ CSV file too large: ${text.length} characters (max ${MAX_CSV_SIZE})`);
          return;
        }
        
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
          let fields;
          try {
            fields = parseCSVLine(line);
          } catch (error) {
            console.error(`Error parsing line ${i + 1}: ${error.message}`);
            continue;
          }

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
        setWinners([]);
        
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

  const parseWheelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        
        // Check file size to prevent DoS
        const MAX_WHEEL_SIZE = 5 * 1024 * 1024; // 5MB
        if (text.length > MAX_WHEEL_SIZE) {
          alert(`❌ .wheel file too large: ${text.length} characters (max ${MAX_WHEEL_SIZE})`);
          return;
        }
        
        // Parse JSON
        const wheelData = JSON.parse(text);
        
        // Validate structure
        if (!wheelData.entries || !Array.isArray(wheelData.entries)) {
          alert('❌ Invalid .wheel file: missing entries array');
          return;
        }
        
        // Filter enabled entries
        const enabledEntries = wheelData.entries.filter(entry => entry.enabled !== false);
        
        if (enabledEntries.length === 0) {
          alert('❌ No enabled entries found in .wheel file');
          return;
        }
        
        // Convert to team format
        const teamsFromWheel = enabledEntries.map((entry, idx) => ({
          id: `wheel-${Date.now()}-${idx}`,
          name: entry.text,
          members: [], // Themes don't have members
          gameId: null,
          color: entry.color || null,
          fromWheel: true,
          weight: entry.weight || 1
        }));
        
        // Add to existing teams
        setTeams(prevTeams => [...prevTeams, ...teamsFromWheel]);
        setWinners([]);
        
        console.log(`✅ Successfully loaded ${teamsFromWheel.length} themes from .wheel file`);
        alert(`✅ Successfully loaded ${teamsFromWheel.length} themes from ${file.name}!`);
        
      } catch (error) {
        console.error('Error parsing .wheel file:', error);
        alert('❌ Error parsing .wheel file. Please check the file format.');
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading .wheel file');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const parseCSVLine = (line) => {
    const MAX_LINE_LENGTH = 10000;
    if (line.length > MAX_LINE_LENGTH) {
      throw new Error(`CSV line too long: ${line.length} characters (max ${MAX_LINE_LENGTH})`);
    }

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

    // Spin directly - winners are recorded locally
    performQuickSpin();
  };

  const performQuickSpin = () => {
    if (teams.length === 0) {
      alert('❌ No teams available for raffle');
      return;
    }
    setSpinning(true);
  };

  const handleSpinComplete = async (winningItem) => {
    // Add winner to the list
    setWinners(prev => [...prev, {
      ...winningItem,
      timestamp: new Date().toLocaleTimeString(),
      id: `winner-${Date.now()}`
    }]);
    setPointerColor(winningItem.color);
    setSpinning(false);

    // Note: Jam raffle mode no longer saves winners as themes
    // Use the /admin/themes page for theme selection instead
  };



  const resetAll = () => {
    setTeams([]);
    setWinners([]);
    setSelectedTeams([]);
    setSpinning(false);
  };

  const clearWinners = () => {
    setWinners([]);
  };

  const addBackWinner = (winnerId) => {
    const winner = winners.find(w => w.id === winnerId);
    if (winner) {
      // Remove from winners
      setWinners(prev => prev.filter(w => w.id !== winnerId));
      // Add back to teams
      setTeams(prev => [...prev, {
        id: winner.id,
        name: winner.name,
        members: winner.members || [],
        color: winner.color,
        gameId: winner.gameId,
        jamId: winner.jamId,
        fromJam: winner.fromJam,
        fromImport: winner.fromImport,
        manual: winner.manual
      }]);
    }
  };

  const removeWinner = (winnerId) => {
    setWinners(prev => prev.filter(w => w.id !== winnerId));
  };



  const addManualTeam = () => {
    if (!newTeamName.trim()) {
      alert('❌ Please enter a team name');
      return;
    }

    const newTeam = {
      id: `manual-${Date.now()}`,
      name: newTeamName.trim(),
      members: newTeamMembers ? newTeamMembers.split(',').map(m => m.trim()).filter(Boolean) : [],
      gameId: null,
      color: null,
      manual: true
    };

    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamMembers('');
  };

  const removeManualTeam = (teamId) => {
    setTeams(teams.filter(team => team.id !== teamId));
    setSelectedTeams(selectedTeams.filter(id => id !== teamId));
  };

  const toggleTeamSelection = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

  const selectAllTeams = () => {
    setSelectedTeams(teams.map(team => team.id));
  };

  const deselectAllTeams = () => {
    setSelectedTeams([]);
  };

  const removeSelectedTeams = () => {
    setTeams(teams.filter(team => !selectedTeams.includes(team.id)));
    setSelectedTeams([]);
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

  if (checkingEnabled) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="text-center">Loading...</div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (!raffleEnabled) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="w-full max-w-none">
            <h1 className="text-4xl font-bold mb-8 text-center">🎡 Team Raffle System</h1>
            <div className="bg-gray-800 border border-gray-700 rounded p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎡</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Raffle Wheel Feature Disabled</h3>
                <p className="text-gray-400">
                  The raffle wheel feature is currently disabled. Enable it from the Front Page settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="w-full max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-center">🎡 Team Raffle System</h1>
          {/* Jam Raffle Mode */}
          {jamRaffleMode ? (
            <div className="w-full px-8">
              <div className="bg-gray-800 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">🎯 Load Teams from Game Jam</h2>

                {/* Jam Selection Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Game Jam
                  </label>
                  <select
                    value={selectedGameJam}
                    onChange={(e) => setSelectedGameJam(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose a Game Jam...</option>
                    {gameJams.map((jam) => (
                      <option key={jam.id} value={String(jam.id)}>
                        {jam.name || jam.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Load Teams Button */}
                <div className="text-center">
                  <button
                    onClick={loadTeamsFromJam}
                    disabled={importing || !selectedGameJam}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition"
                  >
                    {importing ? '🔄 Loading...' : '🎯 Load Teams'}
                  </button>
                </div>

                {/* Info Box */}
                <div className="bg-purple-900 border border-purple-500 rounded-lg p-4 text-purple-200 text-sm">
                  <p className="font-bold mb-2">💡 What happens when you load teams:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Teams are loaded temporarily for raffle</li>
                    <li>You can spin the wheel to randomly select winners</li>
                    <li>Winners are recorded locally for your reference</li>
                    <li>Use the Themes page (/admin/themes) to set jam themes</li>
                    <li>Data is not modified in the database</li>
                  </ul>
                </div>

                <button
                  onClick={() => setJamRaffleMode(false)}
                  className="mt-6 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          ) : (
            /* Setup Screen */
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">🎯 Set Up Your Raffle</h2>
                <p className="text-gray-400 mb-8">Choose how you&apos;d like to add teams or manage existing ones</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition"
                  >
                    <div className="text-3xl mb-3">✏️</div>
                    <div className="font-semibold text-lg mb-2">Add Manually</div>
                    <div className="text-sm text-blue-200">Enter team names one by one</div>
                  </button>

                  <button
                    onClick={() => {
                      setJamSelectorMode('import');
                      setShowJamSelector(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 p-6 rounded-lg transition"
                  >
                    <div className="text-3xl mb-3">📁</div>
                    <div className="font-semibold text-lg mb-2">Import CSV</div>
                    <div className="text-sm text-green-200">Upload a spreadsheet file</div>
                  </button>

                  <button
                    onClick={() => {
                      // Trigger wheel file input
                      document.getElementById('wheel-file-input').click();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 p-6 rounded-lg transition"
                  >
                    <div className="text-3xl mb-3">🎡</div>
                    <div className="font-semibold text-lg mb-2">Import .wheel</div>
                    <div className="text-sm text-orange-200">Upload a .wheel JSON file</div>
                  </button>

                  <button
                    onClick={() => {
                      setJamRaffleMode(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 p-6 rounded-lg transition"
                  >
                    <div className="text-3xl mb-3">🎮</div>
                    <div className="font-semibold text-lg mb-2">Load from Jam</div>
                    <div className="text-sm text-purple-200">Use existing jam teams</div>
                  </button>
                </div>

                {/* Manual Entry Form */}
                {showManualEntry && (
                  <div className="bg-gray-700 p-6 rounded-lg max-w-md mx-auto mb-8">
                    <h3 className="text-xl font-semibold mb-4">Add Team Manually</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Team Name *
                        </label>
                        <input
                          type="text"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="Enter team name"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Team Members (optional)
                        </label>
                        <input
                          type="text"
                          value={newTeamMembers}
                          onChange={(e) => setNewTeamMembers(e.target.value)}
                          placeholder="John, Jane, Bob"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={addManualTeam}
                        className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition font-semibold"
                      >
                        ➕ Add Team
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Teams */}
                {teams.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Current Teams ({teams.length})</h3>
                      <div className="space-x-2">
                        <button
                          onClick={selectAllTeams}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllTeams}
                          className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition"
                        >
                          Deselect All
                        </button>
                        {selectedTeams.length > 0 && (
                          <button
                            onClick={removeSelectedTeams}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                          >
                            Remove Selected ({selectedTeams.length})
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {teams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between bg-gray-600 p-3 rounded">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedTeams.includes(team.id)}
                              onChange={() => toggleTeamSelection(team.id)}
                              className="text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                            />
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                {team.name}
                                {team.manual && <span className="text-xs bg-green-600 px-1 rounded">Manual</span>}
                                {team.fromJam && <span className="text-xs bg-purple-600 px-1 rounded">Jam</span>}
                                {team.fromImport && <span className="text-xs bg-blue-600 px-1 rounded">Import</span>}
                                {team.fromWheel && <span className="text-xs bg-orange-600 px-1 rounded">Wheel</span>}
                              </div>
                              {team.members && team.members.length > 0 && (
                                <div className="text-sm text-gray-300">
                                  {team.members.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          {(team.manual || team.fromJam || team.fromImport || team.fromWheel) && (
                            <button
                              onClick={() => removeManualTeam(team.id)}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm transition"
                              title="Remove this team"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raffle Mode Controls */}
                {teams.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                      <button
                        onClick={() => {
                          if (teams.length > 0) {
                            const lastTeam = teams[teams.length - 1];
                            setTeams(prev => prev.filter(t => t.id !== lastTeam.id));
                          }
                        }}
                        disabled={teams.length === 0}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition"
                      >
                        ❌ Remove Team
                      </button>

                      <button
                        onClick={() => {
                          if (winners.length > 0) {
                            const lastWinner = winners[winners.length - 1];
                            addBackWinner(lastWinner.id);
                          }
                        }}
                        disabled={winners.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition"
                      >
                        ↩️ Add Back Team
                      </button>

                      <button
                        onClick={spinWheel}
                        disabled={spinning || teams.length === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition"
                      >
                        {spinning ? '🔄 Spinning...' : '🎲 Spin the Wheel!'}
                      </button>

                      <button
                        onClick={resetAll}
                        className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition"
                      >
                        🔄 Reset All
                      </button>
                    </div>

                    <div className="text-center mt-4 text-gray-400">
                      {teams.length} team{teams.length !== 1 ? 's' : ''} remaining • {winners.length} winner{winners.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Hidden file inputs */}
                <input
                  id="wheel-file-input"
                  type="file"
                  accept=".wheel"
                  onChange={handleWheelFileUpload}
                  className="hidden"
                />

                {/* Winners Display */}
                {winners.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">🏆 Winners ({winners.length}) 🏆</h2>
                      <button
                        onClick={clearWinners}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {winners.map((winner, index) => (
                        <div key={winner.id} className="bg-white bg-opacity-20 rounded p-3 flex justify-between items-center">
                          <div className="flex-1">
                            <span className="font-bold text-lg">#{index + 1}: {winner.name}</span>
                            {winner.members && winner.members.length > 0 && (
                              <span className="text-sm ml-2 text-gray-800">
                                ({winner.members.join(', ')})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{winner.timestamp}</span>
                            <button
                              onClick={() => removeWinner(winner.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove winner"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wheel Container */}
                {teams.length > 0 && (
                  <div className="flex gap-8 mb-8 px-8">
                    {/* Participant List - Left Side */}
                    <div className="flex-2">
                      <div className="bg-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6 text-center">🎯 Current Participants ({teams.length})</h3>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {teams.map((team, index) => (
                            <div key={team.id} className="bg-gray-600 rounded-lg p-4 flex items-center justify-between hover:bg-gray-500 transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-gray-300 min-w-[2rem]">#{index + 1}</span>
                                <div className="flex-1">
                                  <div className="font-semibold text-white text-lg">{team.name}</div>
                                  {team.members && team.members.length > 0 && (
                                    <div className="text-sm text-gray-300 mt-1">
                                      👥 {team.members.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: team.color }}
                                title={`Color: ${team.color}`}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Wheel - Right Side */}
                    <div className="flex-1 flex justify-center">
                      <div className="relative">
                        <SpinWheel
                          items={teamItems}
                          spinning={spinning}
                          pointerColor={pointerColor}
                          onSpinComplete={handleSpinComplete}
                          size={500}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Jam Selector Popup */}
          {showJamSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-center">
                  🎯 {jamSelectorMode === 'import' ? 'Select Game Jam for Import' : 'Select Game Jam'}
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
                      : 'Teams will be loaded from the selected Game Jam'}
                  </p>
                </div>

                {/* File Upload for Import Mode */}
                {jamSelectorMode === 'import' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Upload CSV File</label>
                    <label className={`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg cursor-pointer inline-block transition w-full text-center ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      📁 {pendingImportFile ? pendingImportFile.name : 'Choose CSV File'}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={importing}
                        className="hidden"
                      />
                    </label>
                    {pendingImportFile && (
                      <p className="text-green-400 text-sm mt-2">
                        ✅ {pendingImportFile.name} selected ({(pendingImportFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                )}

                {/* Messages */}
                {importError && (
                  <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-4 text-red-200">
                    <p className="font-bold">❌ {jamSelectorMode === 'import' ? 'Import' : 'Load'} Error</p>
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
                    } : loadTeamsFromJam}
                    disabled={importing || !selectedGameJam || (jamSelectorMode === 'import' && !pendingImportFile)}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      jamSelectorMode === 'import'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                  >
                    {jamSelectorMode === 'import' 
                      ? '✅ Select Jam' 
                      : (importing ? '🔄 Loading...' : '🎯 Load Teams')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>💡 Load teams first, then spin the wheel to randomly select winners. Use the Themes page for setting jam themes.</p>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}