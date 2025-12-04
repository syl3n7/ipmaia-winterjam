# Working with Imported Team Data

## Database Queries

### Find All Imported Teams for a Game Jam

```sql
SELECT 
  g.id,
  g.team_name,
  g.team_members,
  g.title,
  g.custom_fields->>'contact_email' as email,
  g.custom_fields->>'contact_phone' as phone,
  g.custom_fields->>'institution' as institution
FROM games g
WHERE g.game_jam_id = 1
  AND g.title LIKE '%[Pending Game Name]%'
ORDER BY g.created_at DESC;
```

### Find Teams with Dietary Restrictions

```sql
SELECT 
  g.team_name,
  g.team_members,
  g.custom_fields->>'allergies' as has_allergies,
  g.custom_fields->>'allergies_details' as allergy_details,
  g.custom_fields->>'specific_diet' as diet_info,
  g.custom_fields->>'contact_email' as contact
FROM games g
WHERE g.game_jam_id = 1
  AND (g.custom_fields->>'allergies' = 'true' 
       OR g.custom_fields->>'specific_diet' != '')
ORDER BY g.team_name;
```

### Get Teams by Institution

```sql
SELECT 
  g.custom_fields->>'institution' as institution,
  COUNT(*) as team_count,
  ARRAY_AGG(g.team_name) as teams
FROM games g
WHERE g.game_jam_id = 1
GROUP BY g.custom_fields->>'institution'
ORDER BY team_count DESC;
```

### Find Teams Attending Both Dinners

```sql
SELECT 
  g.team_name,
  g.team_members,
  g.custom_fields->>'friday_dinner' as friday_option,
  g.custom_fields->>'dinner_attendance' as attendance
FROM games g
WHERE g.game_jam_id = 1
  AND (g.custom_fields->>'dinner_attendance' ILIKE '%sim%'
       OR g.custom_fields->>'dinner_attendance' ILIKE '%yes%')
ORDER BY g.team_name;
```

### Teams Needing Equipment

```sql
SELECT 
  g.team_name,
  g.custom_fields->>'equipment_request' as equipment,
  g.custom_fields->>'team_size' as team_size,
  g.custom_fields->>'contact_email' as contact
FROM games g
WHERE g.game_jam_id = 1
  AND g.custom_fields->>'equipment_request' != ''
ORDER BY g.team_name;
```

### Export Team Contact Info

```sql
COPY (
  SELECT 
    g.team_name,
    g.custom_fields->>'contact_email' as email,
    g.custom_fields->>'contact_phone' as phone,
    g.custom_fields->>'institution' as institution,
    ARRAY_LENGTH(g.team_members, 1) as member_count
  FROM games g
  WHERE g.game_jam_id = 1
  ORDER BY g.team_name
) TO STDOUT WITH (FORMAT CSV, HEADER);
```

## Backend API Usage

### Get All Games for a Game Jam (includes team data)

```javascript
// GET /api/admin/games
const response = await fetch('/api/admin/games');
const games = await response.json();

const teamGames = games.filter(g => 
  g.title.includes('[Pending Game Name]')
);
```

### Update a Game with Actual Details

After teams are imported, update with real game info:

```javascript
// PUT /api/admin/games/:id
const gameId = 45;
const updateData = {
  title: "Interdimensional Cat",
  description: "A platformer about a lost cat...",
  github_url: "https://github.com/...",
  itch_url: "https://itch.io/...",
  screenshot_urls: ["url1", "url2"],
  tags: ["platformer", "puzzle", "2.5D"]
};

const response = await fetch(`/api/admin/games/${gameId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});
```

### Make Custom Fields Public (Optional)

By default, custom fields are hidden. To show specific data:

```javascript
const gameId = 45;
const updateData = {
  custom_fields_visibility: {
    // Make institution visible
    institution: true,
    // Make contact hidden
    contact_email: false,
    contact_phone: false,
    // Keep registration data hidden
    allergies: false,
    allergies_details: false
  }
};

await fetch(`/api/admin/games/${gameId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});
```

## Frontend Component Usage

### Display Team Registration Info

```javascript
// In a game detail component
import { useState, useEffect } from 'react';

export default function GameDetail({ gameId }) {
  const [game, setGame] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/games/${gameId}`)
      .then(r => r.json())
      .then(setGame);
  }, [gameId]);

  if (!game) return <div>Loading...</div>;

  const customFields = game.custom_fields || {};
  const visibility = game.custom_fields_visibility || {};

  return (
    <div>
      <h1>{game.title}</h1>
      <p>Team: {game.team_name}</p>
      
      <div className="team-members">
        <h3>Members ({game.team_members.length})</h3>
        <ul>
          {game.team_members.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>

      {visibility.institution && (
        <div className="institution">
          <strong>Institution:</strong> {customFields.institution}
        </div>
      )}

      {visibility.contact_email && (
        <div className="contact">
          <strong>Email:</strong> {customFields.contact_email}
        </div>
      )}

      {/* Only show if team has allergies and field is visible */}
      {customFields.allergies === 'true' && visibility.allergies_details && (
        <div className="alert">
          <strong>⚠️ Allergies:</strong> {customFields.allergies_details}
        </div>
      )}
    </div>
  );
}
```

## Data Analysis Examples

### JavaScript - Analyze Team Data

```javascript
// After fetching games
const games = await fetch('/api/admin/games').then(r => r.json());

// Filter imported teams
const teamGames = games.filter(g => g.title.includes('[Pending Game Name]'));

// Group by institution
const byInstitution = teamGames.reduce((acc, game) => {
  const inst = game.custom_fields?.institution || 'Unknown';
  if (!acc[inst]) acc[inst] = [];
  acc[inst].push(game.team_name);
  return acc;
}, {});

console.log('Teams by Institution:', byInstitution);

// Count dietary restrictions
const withRestrictions = teamGames.filter(g => 
  g.custom_fields?.allergies === 'true' ||
  g.custom_fields?.specific_diet
).length;

console.log(`Teams with restrictions: ${withRestrictions}`);

// Find returning participants
const returning = teamGames.filter(g =>
  g.custom_fields?.previous_participation === 'true'
);

console.log(`Returning teams: ${returning.length}`);
```

## Exporting Data

### Export to CSV (Node.js Backend)

```javascript
// In a backend route
const { Parser } = require('json2csv');
const Game = require('../models/Game');

router.get('/export/teams-csv', requireAdmin, async (req, res) => {
  try {
    const { gameJamId } = req.query;
    const games = await Game.findByGameJam(gameJamId);
    
    // Filter teams (games with '[Pending Game Name]')
    const teams = games.filter(g => g.title.includes('[Pending Game Name]'));
    
    const csvData = teams.map(g => ({
      team_name: g.team_name,
      members_count: g.team_members.length,
      members: g.team_members.join('; '),
      email: g.custom_fields?.contact_email,
      phone: g.custom_fields?.contact_phone,
      institution: g.custom_fields?.institution,
      allergies: g.custom_fields?.allergies_details,
      diet: g.custom_fields?.specific_diet,
      full_attendance: g.custom_fields?.full_attendance
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=teams.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Generate Reports

```javascript
// Generate a logistics report
function generateLogisticsReport(games) {
  const report = {
    total_teams: games.length,
    total_members: games.reduce((sum, g) => sum + g.team_members.length, 0),
    dietary_needs: {
      total_with_restrictions: 0,
      restrictions: []
    },
    equipment_needed: [],
    institution_breakdown: {}
  };

  games.forEach(game => {
    const cf = game.custom_fields;
    
    // Count dietary restrictions
    if (cf?.allergies === 'true') {
      report.dietary_needs.total_with_restrictions++;
      report.dietary_needs.restrictions.push({
        team: game.team_name,
        details: cf?.allergies_details
      });
    }

    // Equipment needs
    if (cf?.equipment_request) {
      report.equipment_needed.push({
        team: game.team_name,
        equipment: cf.equipment_request.split(';').map(e => e.trim())
      });
    }

    // Institution breakdown
    const inst = cf?.institution || 'Unknown';
    report.institution_breakdown[inst] = 
      (report.institution_breakdown[inst] || 0) + 1;
  });

  return report;
}

// Usage
const report = generateLogisticsReport(teamGames);
console.log(JSON.stringify(report, null, 2));
```

## Updating Batch Data

### Update Multiple Games

```javascript
// Update all imported games with game jam info
async function addGameDetails(games, gameJamId) {
  const updates = [
    {
      id: games[0].id,
      title: "Final Game Title",
      description: "Full game description",
      tags: ["puzzle", "adventure"]
    },
    // ... more updates
  ];

  for (const update of updates) {
    await fetch(`/api/admin/games/${update.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
  }
}
```

## Testing Data Queries

### Quick validation in browser console

```javascript
// Check import worked
fetch('/api/admin/games')
  .then(r => r.json())
  .then(games => {
    const imported = games.filter(g => g.title.includes('[Pending Game Name]'));
    console.table(imported.map(g => ({
      team: g.team_name,
      members: g.team_members.length,
      email: g.custom_fields?.contact_email
    })));
  });
```
