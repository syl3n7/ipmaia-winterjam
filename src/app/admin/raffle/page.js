'use client';
import { useState, useRef, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function RafflePage() {
  const [teams, setTeams] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [removedTeams, setRemovedTeams] = useState([]);
  const wheelRef = useRef(null);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Validate we have at least header + 1 team
        if (lines.length < 2) {
          alert('❌ CSV file appears to be empty or has no data rows');
          event.target.value = '';
          return;
        }

        // Check if header contains expected columns
        const header = lines[0].toLowerCase();
        if (!header.includes('nome da equipa') && !header.includes('team')) {
          alert('⚠️ Warning: CSV may not have the expected format. Looking for "Nome da Equipa" column.');
        }
        
        // Parse teams - skip header
        const parsedTeams = [];
        const seenNames = new Set();
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          // Better CSV parsing - handle quoted fields with commas inside
          const csvRegex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          const fields = [];
          let match;
          
          while ((match = csvRegex.exec(line)) !== null) {
            if (match[1] !== undefined) {
              fields.push(match[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim());
            }
          }
          
          // Get team name (2nd column - index 1)
          if (fields.length < 2) continue;
          
          let teamName = fields[1].trim();
          
          // Validation checks
          if (!teamName || teamName === '') {
            console.warn(`Row ${i + 1}: Empty team name, skipping`);
            continue;
          }
          
          // Handle duplicates (from the CSV data)
          if (seenNames.has(teamName.toLowerCase())) {
            console.warn(`Row ${i + 1}: Duplicate team "${teamName}" found, skipping`);
            continue;
          }
          
          // Truncate very long names
          if (teamName.length > 50) {
            teamName = teamName.substring(0, 47) + '...';
          }
          
          seenNames.add(teamName.toLowerCase());
          parsedTeams.push({
            id: i - 1,
            name: teamName,
            originalLine: line
          });
        }

        // Validate we got at least one valid team
        if (parsedTeams.length === 0) {
          alert('❌ No valid teams found in CSV file. Please check the format.');
          event.target.value = '';
          return;
        }

        // Success!
        setTeams(parsedTeams);
        setRemovedTeams([]);
        setSelectedTeam(null);
        setRotation(0);
        
        console.log(`✅ Successfully loaded ${parsedTeams.length} teams`);
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('❌ Error parsing CSV file. Please check the file format.');
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
      event.target.value = '';
    };

    reader.readAsText(file, 'UTF-8');
  };

  const spinWheel = () => {
    if (spinning || teams.length === 0) return;

    setSpinning(true);
    setSelectedTeam(null);

    // Random spins between 5-8 full rotations plus random final position
    const extraSpins = Math.floor(Math.random() * 4) + 5;
    const randomDegree = Math.random() * 360;
    const totalRotation = rotation + (extraSpins * 360) + randomDegree;

    setRotation(totalRotation);

    // Calculate which team was selected
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const segmentAngle = 360 / teams.length;
      // Adjust for pointer at top (12 o'clock)
      const adjustedRotation = (360 - normalizedRotation + 90) % 360;
      const selectedIndex = Math.floor(adjustedRotation / segmentAngle) % teams.length;
      
      setSelectedTeam(teams[selectedIndex]);
      setSpinning(false);
    }, 4000);
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

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">🎡 Team Raffle Wheel</h1>
          
          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div>
                <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg cursor-pointer inline-block transition">
                  📁 Upload CSV
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
            </div>
          )}

          {/* Wheel Container */}
          {teams.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-lg"></div>
                </div>

                {/* Wheel */}
                <div 
                  ref={wheelRef}
                  className="relative w-[600px] h-[600px] rounded-full overflow-hidden shadow-2xl border-8 border-gray-700"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                  }}
                >
                  {teams.map((team, index) => {
                    const segmentAngle = 360 / teams.length;
                    const startAngle = index * segmentAngle;
                    
                    // Calculate the end points for the slice using SVG path
                    const radius = 300; // Half of 600px
                    const centerX = 300;
                    const centerY = 300;
                    
                    // Convert to radians
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (startAngle + segmentAngle - 90) * Math.PI / 180;
                    
                    // Calculate arc points
                    const x1 = centerX + radius * Math.cos(startRad);
                    const y1 = centerY + radius * Math.sin(startRad);
                    const x2 = centerX + radius * Math.cos(endRad);
                    const y2 = centerY + radius * Math.sin(endRad);
                    
                    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      'Z'
                    ].join(' ');
                    
                    // Text positioning
                    const textAngle = startAngle + segmentAngle / 2;
                    const textRadius = radius * 0.65;
                    const textRad = (textAngle - 90) * Math.PI / 180;
                    const textX = centerX + textRadius * Math.cos(textRad);
                    const textY = centerY + textRadius * Math.sin(textRad);
                    
                    return (
                      <svg
                        key={team.id}
                        className="absolute top-0 left-0 w-full h-full"
                        viewBox="0 0 600 600"
                      >
                        <path
                          d={pathData}
                          fill={getWheelColors(index, teams.length)}
                          stroke="#1f2937"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                          style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          {team.name.length > 18 ? team.name.substring(0, 15) + '...' : team.name}
                        </text>
                      </svg>
                    );
                  })}
                  
                  {/* Center Circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-800 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teams Lists */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Teams */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">📋 Active Teams</h2>
              {teams.length === 0 ? (
                <p className="text-gray-400">No teams loaded. Upload a CSV file to start!</p>
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
                      {team.name}
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
                      className="p-3 rounded bg-gray-700 flex justify-between items-center"
                    >
                      <span>{team.name}</span>
                      <button
                        onClick={() => restoreTeam(team)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>⚠️ This is temporary data only - refresh the page and everything resets!</p>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
