# CSV Import Integration - Setup & Testing Guide

## Quick Start

### Prerequisites
- Backend server running (`npm run dev` in backend folder)
- Admin account with proper authentication
- At least one Game Jam created in the system

### Installation

No additional dependencies needed - the CSV import uses only existing packages:
- `multer` (already in package.json for file uploads)
- `express` (routing)
- `pg` (database)

If `multer` is missing, install it:
```bash
cd backend
npm install multer@2.0.2
```

### File Structure
```
backend/
├── utils/
│   └── csvParser.js              ← NEW: CSV parsing & validation
├── routes/
│   └── admin.js                  ← UPDATED: Added import endpoint
└── package.json                  ← Already has multer

src/app/admin/raffle/
└── page.js                        ← UPDATED: Two-mode interface
```

## How It Works

### Mode 1: Local Raffle (Original Behavior)
```
User → Upload CSV → Parse locally → Show wheel → Spin → No DB save
```

### Mode 2: Import & Save (NEW)
```
User → Select Game Jam → Upload CSV → 
API validates → Creates game records → 
Save all team data to DB → Show results
```

## Testing the Integration

### Test 1: Basic Import

**CSV File:** Use the provided `public/Registo Participação - WinterJam 2025.csv`

**Steps:**
1. Start backend: `npm run dev` (in backend folder)
2. Go to: http://localhost:3000/admin/raffle
3. Click "Import from CSV (Save to DB)" button
4. Select "WinterJam 2025" from dropdown
5. Click "Upload CSV" and select the CSV file
6. Wait for import to complete

**Expected Result:**
- ✅ Shows "Successfully imported X teams!"
- ✅ New games visible in Admin → Games
- ✅ Teams listed with all members

### Test 2: Validation Errors

**Create test CSV with errors:**
```csv
"Carimbo de data/hora","Nome da Equipa","Número de Elementos da Equipa","Nome dos Membros da Equipa","Email de Contacto Principal (Líder do Grupo)","Telemóvel de Contacto (Opcional)","Instituição / Curso (Se Aplicável)"
"2025/11/19 11:10:50 p.m. GMT+0","","3 Elementos","João, Filipe, Valente","test@example.com","","IPMAIA"
"2025/11/19 11:10:50 p.m. GMT+0","Valid Team","1 Elementos","","invalid-email","","IPMAIA"
"2025/11/19 11:10:50 p.m. GMT+0","Another Team","3 Elementos","João, Filipe, Valente","test2@example.com","","IPMAIA"
```

**Expected Result:**
- Row 1 error: "Team name is required"
- Row 2 error: "Invalid email address"
- Row 3 imports successfully
- Shows: "1 successfully imported, 2 failed"

### Test 3: Duplicate Teams

**Steps:**
1. Create CSV with duplicate team names (same team twice)
2. Upload and import

**Expected Result:**
- Second duplicate is skipped
- Warning: "Duplicate team 'Team Name' found, skipping"

### Test 4: Local Raffle Mode

**Steps:**
1. Click "Quick Raffle (Local)" mode
2. Upload same CSV
3. Try spinning the wheel

**Expected Result:**
- Teams loaded locally (no DB changes)
- Spinning works as before
- Reloading page clears everything

### Test 5: Verify Database

**After successful import, check database:**

```sql
-- See newly created games
SELECT id, title, team_name, team_members, custom_fields->>'contact_email' as email
FROM games
WHERE title LIKE '%[Pending Game Name]%'
LIMIT 5;

-- Check team details in custom_fields
SELECT 
  id,
  team_name,
  team_members,
  custom_fields->>'institution' as institution,
  custom_fields->>'allergies' as has_allergies,
  custom_fields->>'contact_email' as email
FROM games
WHERE game_jam_id = 1
LIMIT 10;
```

## Common Issues

### Issue: "Unsupported Media Type" Error
**Solution:** Ensure `multer` is installed:
```bash
npm install multer@2.0.2
```

### Issue: "No Game Jams available"
**Solution:** Create a Game Jam first in Admin → Game Jams

### Issue: Import shows 0 teams
**Possible causes:**
1. CSV header doesn't match expected format
2. No data rows in CSV
3. All rows failed validation

**Debug:**
- Check browser console for error messages
- Check backend logs for validation details
- Ensure CSV has proper headers

### Issue: Special characters showing as ???
**Solution:** Ensure CSV is saved as UTF-8 with BOM

## API Testing with cURL

```bash
# Test the import endpoint directly
curl -X POST http://localhost:3000/api/admin/games/import-teams \
  -H "Cookie: your_session_cookie" \
  -F "gameJamId=1" \
  -F "csv=@/path/to/file.csv"
```

## Frontend States

### Import Mode - Sections

1. **Game Jam Selection**
   - Shows available game jams
   - Must select before uploading
   - Disabled while importing

2. **File Upload**
   - "Upload CSV" button
   - Disabled until game jam selected
   - Shows "Importing..." state

3. **Result Messages**
   - Green success box on success
   - Red error box on failure
   - Shows detailed warnings

4. **Info Box**
   - Explains what import does
   - Lists features and benefits
   - Back button to switch modes

### Teams Display

After import or local load:
1. **Active Teams List**
   - Shows team names + members
   - Highlights selected team
   - Scrollable list

2. **Winners / Removed List**
   - Shows removed teams
   - Restore buttons available
   - Scrollable list

3. **Spinning Wheel**
   - Color-coded segments
   - Team names on wheel
   - Smooth animation

## Performance Notes

- **CSV Parsing:** < 100ms for typical 12-team CSV
- **Database Insert:** ~50-100ms per team
- **Total Import Time:** 1-2 seconds for 12 teams
- **Concurrent Users:** No special optimization (can be added later)

## Next Steps After Import

1. **Edit Game Details**
   - Go to Admin → Games
   - Find games with "[Pending Game Name]" title
   - Edit to add actual game title, description, links

2. **Manage Team Data**
   - All registration info preserved in custom_fields
   - Can export to CSV for logistics planning
   - Can unhide specific fields for display

3. **Organize by Preferences**
   - Use equipment_request field for resource planning
   - Use allergies_details for catering
   - Use institution for group management

## Troubleshooting Logs

### Enable debug logging:

**Backend (admin.js):**
```javascript
// Already has console.log statements
// Check terminal for 📋 CSV Import logs
```

**Frontend (browser console):**
- Check for import error messages
- Check Network tab for API responses
- Look for form validation errors

## Security Checklist

- ✅ Only admins can import
- ✅ CSV files max 5MB
- ✅ Dangerous characters removed
- ✅ Email format validated
- ✅ SQL injection protected (parameterized queries)
- ✅ File type verified (CSV only)

## Support

If you encounter issues:

1. Check the INTEGRATION_GUIDE.md for detailed architecture
2. Review the csvParser.js for validation rules
3. Check backend logs for import errors
4. Test with provided sample CSV first
