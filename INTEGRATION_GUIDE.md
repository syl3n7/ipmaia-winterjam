# Team Registration CSV Import & Integration Guide

## Overview

This system integrates team registration data from the WinterJam 2025 CSV with the games management system. Teams can be imported directly into the database and later assigned game titles and details.

## Architecture

### Three-Layer Integration

```
1. Frontend (Raffle Page) 
   ↓ uploads CSV
2. API Endpoint (/admin/games/import-teams)
   ↓ parses & validates
3. Database (games table with custom_fields)
   ↓ stores team + registration data
```

## Components

### 1. Backend CSV Parser (`backend/utils/csvParser.js`)

**Purpose:** Parse and validate CSV data from WinterJam registration form

**Exported Functions:**

- `parseCSV(csvText)` → `{ teams: Array, errors: Array }`
  - Main entry point for CSV parsing
  - Handles malformed CSV with quoted fields and commas
  - Returns validated team data and any errors encountered

- `validateTeamData(teamData, rowNumber)` → `Array<string>`
  - Validates individual team data
  - Checks required fields, formats, and constraints
  - Returns array of validation error messages

- `sanitizeTeamName(name)` → `string`
  - Removes dangerous characters
  - Truncates to 100 chars max
  - Used before storing in database

- `sanitizeMemberNames(members)` → `Array<string>`
  - Sanitizes each member name
  - Filters out empty entries
  - Validates character set (names with accents supported)

**Validation Rules:**

| Field | Rules |
|-------|-------|
| Team Name | Required, 1-100 chars, no HTML |
| Members | Required, 1-20 members max, names 1-150 chars |
| Email | Required, valid format |
| Team Size | 1-20 |
| Regulations | Must be accepted |
| Members | Must match regex for names (supports Portuguese accents) |

### 2. API Endpoint (`backend/routes/admin.js`)

**Route:** `POST /admin/games/import-teams`

**Middleware:**
- `requireAdmin` - Admin authentication required
- `multer` - File upload handling (5MB max, CSV only)

**Request:**
```json
{
  "gameJamId": "number"  // Required in form data
}
```
File: `csv` multipart field

**Response (Success):**
```json
{
  "message": "CSV import completed",
  "summary": {
    "total_teams_in_csv": 12,
    "successfully_imported": 12,
    "failed": 0,
    "warnings": 0
  },
  "results": {
    "imported": [
      {
        "id": 45,
        "teamName": "F.O.V.",
        "members": ["João Osorio", "Filipe Cunha", "Valente"],
        "gameId": 45
      }
    ],
    "failed": [],
    "warnings": []
  },
  "gameJam": {
    "id": 1,
    "name": "WinterJam 2025"
  }
}
```

**Response (Error):**
```json
{
  "error": "error message",
  "details": ["error 1", "error 2"]  // Optional
}
```

**What Happens:**

1. Validates CSV file (must be CSV format, max 5MB)
2. Verifies Game Jam exists
3. Parses CSV using `csvParser.js`
4. For each valid team:
   - Creates a `Game` record with team info
   - Stores all registration data in `custom_fields`
   - Sets all custom fields to hidden by default (`custom_fields_visibility`)
   - Title format: `{Team Name} - [Pending Game Name]`
   - Prepares data for later game details to be added

### 3. Frontend Component (`src/app/admin/raffle/page.js`)

**Two Modes:**

#### Mode A: Local Raffle (Original)
- Upload CSV locally
- Spin wheel for random selection
- No database changes
- Data resets on page refresh

#### Mode B: Import & Save
- Select target Game Jam
- Upload CSV
- Teams imported to database
- Can later edit games to add actual game info
- Shows import results with success/failure counts

**Features:**

- **Game Jam Selection:** Dropdown to choose target Game Jam for imports
- **Real-time Validation:** Client-side CSV validation before upload
- **Error Handling:** Displays import errors and warnings
- **Feedback Messages:** Shows successful imports with team details
- **Integration:** Successfully imported teams ready for game management

## Data Storage

### Imported Team Data in Database

Teams are stored in the `games` table with the following structure:

```sql
-- Base fields
team_name          -- "F.O.V."
team_members       -- ["João Osorio", "Filipe Cunha", "Valente"]
title              -- "F.O.V. - [Pending Game Name]"

-- In custom_fields (JSON)
institution        -- "IPMAIA / DJD"
full_attendance    -- true/false
equipment_request  -- "Extensões"
allergies          -- true/false
allergies_details  -- "..."
specific_diet      -- "..."
contact_email      -- "goncalo.p.valente@hotmail.com"
contact_phone      -- ""
team_size          -- 3
```

### Field Mapping

CSV Header → Database Field:

```
"Nome da Equipa" → team_name
"Nome dos Membros da Equipa" → team_members (array)
"Email de Contacto Principal" → custom_fields.contact_email
"Telemóvel de Contacto" → custom_fields.contact_phone
"Instituição / Curso" → custom_fields.institution
"Equipa vai estar presente durante todo o evento?" → custom_fields.full_attendance
"Ja participaram anteriormente" → custom_fields.previous_participation
"Vão precisar de requisitar equipamento?" → custom_fields.equipment_request
"Alergias ou restrições alimentares" → custom_fields.allergies
"Especificar quais" → custom_fields.allergies_details
"Dieta específica" → custom_fields.specific_diet
"Autorizam o uso de fotos" → custom_fields.photo_consent
"Confirmam que leram e aceitaram" → custom_fields.regulation_accept
"Como souberam do evento?" → custom_fields.how_found
"Equipa vai comparecer aos 2 jantares" → custom_fields.dinner_attendance
"Opção do Jantar de Sexta" → custom_fields.friday_dinner
"Carimbo de data/hora" → custom_fields.registration_timestamp
```

## Usage Workflow

### Step 1: Prepare CSV
Ensure CSV has columns from WinterJam registration form (headers are auto-detected, order doesn't matter)

### Step 2: Import Teams
1. Go to Admin → Raffle page
2. Select "Import from CSV (Save to DB)" mode
3. Select target Game Jam
4. Upload CSV file
5. Review import summary

### Step 3: Edit Games
After import, admin can:
1. Go to Games management
2. Find newly imported games (title shows "[Pending Game Name]")
3. Edit to add:
   - Actual game title
   - Full description
   - GitHub/Itch.io links
   - Screenshots
   - Rankings
   - Any other game details

### Step 4: Manage Team Data
All registration details are stored but hidden by default:
- Allergies, dietary restrictions available for logistics
- Contact info preserved for communication
- Attendance info for planning
- Previous participation data for organizing groups

Can unhide specific fields via `custom_fields_visibility` for public display if needed.

## Error Handling

### Validation Errors
Logged when:
- Team name is empty or too long
- Required members list is empty or members have invalid names
- Email format is invalid
- Team size out of range
- Regulation not accepted

### Import Errors
- CSV file format issues
- Missing required columns (tries fuzzy matching)
- Database errors during game creation
- Game Jam not found

### Error Response
```json
{
  "error": "No valid teams found in CSV",
  "details": [
    "Row 5: Team name is required",
    "Row 7: Invalid email address",
    "Row 12: Duplicate team 'Team A' found, skipping"
  ]
}
```

## Security Considerations

1. **Authentication:** Endpoint requires admin role
2. **Input Sanitization:** 
   - HTML/script tags removed from team names
   - Special characters escaped
   - Email format validated
3. **File Upload:**
   - Type validation (CSV only)
   - Size limit (5MB)
   - Memory storage (not disk)
4. **SQL Injection:** Parameterized queries via pg library

## Performance Notes

- CSV parsing is synchronous (should be fine for <100 teams)
- Each team creates one game record (N database inserts)
- Game Jam must be pre-created before import
- No batch validation - processes one team at a time

## Testing

### Test CSV Format
```csv
"Carimbo de data/hora","Nome da Equipa","Número de Elementos da Equipa","Nome dos Membros da Equipa","Email de Contacto Principal (Líder do Grupo)","Telemóvel de Contacto (Opcional)","Instituição / Curso (Se Aplicável)"
"2025/11/19 11:10:50 p.m. GMT+0","F.O.V.","3 Elementos","João Osorio, Filipe Cunha, Valente","test@example.com","","IPMAIA"
```

### Test Scenarios
1. ✅ Valid teams with all data
2. ✅ Missing optional fields (phone, institution)
3. ✅ Duplicate team names (should skip)
4. ✅ Invalid email formats
5. ✅ Too many members (>20)
6. ✅ Empty team names
7. ✅ Malformed CSV with quoted commas
8. ✅ Wrong Game Jam ID
9. ✅ No admin privileges

## Future Enhancements

- [ ] Batch update teams with game names via CSV
- [ ] Export games back to CSV with details
- [ ] Team merger/split functionality  
- [ ] Email notifications on import complete
- [ ] Import history/audit log
- [ ] Scheduled imports from external service
- [ ] Dynamic custom field templates per Game Jam
