# Quick Reference - CSV Import for Admins

## 🚀 Quick Start (2 minutes)

### Prerequisites
- Backend running: `npm run dev` (in backend folder)
- At least one Game Jam created
- Admin access

### Steps
1. Go to: http://localhost:3000/admin/raffle
2. Click: "📥 Import from CSV (Save to DB)" button
3. Select: Game Jam from dropdown
4. Upload: Your registration CSV file
5. Done! Teams saved to database

## 📋 What Gets Saved?

When you import teams, all this data is stored:

```
✅ Team Name
✅ Team Members (up to 20 people)
✅ Email & Phone
✅ Institution/Course
✅ Allergies & Dietary Restrictions
✅ Equipment Requests
✅ Attendance Info
✅ Previous Participation
✅ Photo Consent
✅ Regulation Acceptance
✅ How They Heard About Event
```

## 🎮 Two Modes

| Mode | Use For | Data |
|------|---------|------|
| 🎲 **Quick Raffle (Local)** | Fun spinning | Temporary, lost on refresh |
| 📥 **Import & Save** | Add to database | Saved forever, queryable |

## ✅ Validation Rules

Your CSV must have:
- ✅ Team names (required)
- ✅ At least one member name (required)
- ✅ Valid email address (required)
- ✅ Regulation acceptance (required)

Won't import teams with:
- ❌ Missing team name
- ❌ Empty member list
- ❌ Invalid email format
- ❌ Duplicate team names
- ❌ Unaccepted regulations

## 🛠️ After Import - Next Steps

### Step 1: See Imported Teams
```
Admin → Games
Look for: "[Pending Game Name]"
```

### Step 2: Edit Each Game
1. Click the game
2. Change title from "[Pending Game Name]" to actual game name
3. Add description, links, screenshots
4. Save

### Step 3: Use Team Data
- **For Catering:** Check allergies & dietary info
- **For Logistics:** See equipment requests
- **For Planning:** View by institution/attendance

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| **File won't upload** | Make sure it's .csv format, < 5MB |
| **0 teams imported** | Check CSV headers match WinterJam form |
| **Only 5 teams imported, not 12** | Others failed validation - check errors |
| **Can't find imported games** | Search Admin → Games for "[Pending Game Name]" |
| **"No Game Jams available"** | Create a Game Jam first: Admin → Game Jams |

## 💡 Tips

- 📌 **Header Detection:** Automatically detects column positions, order doesn't matter
- 🔄 **Duplicates:** Automatically skips duplicate team names
- 🌍 **Accents:** Supports Portuguese and European characters
- 📞 **Optional Fields:** Phone & institution can be empty
- 🔐 **Admin Only:** Regular users can't import (security)

## 📊 Common Queries (for power users)

### Find teams with dietary restrictions
```
Admin → Games → Filter by institution/allergies in custom fields
```

### Export to Excel for catering
```
Use admin export function or copy from database
All team info available in custom_fields
```

### Group by institution
```
Admin can query database:
SELECT institution, COUNT(*) FROM games GROUP BY institution
```

## ⏱️ Timeline

```
Before Import:
- CSV file has all data
- No games in system

After Import (1-2 seconds):
- Games created with team info
- All registration data stored
- Ready for editing

After Editing:
- Real game titles added
- Games displayed to public
- Team data accessible for planning
```

## 📱 What Admins Can Do Next

1. **Edit Games** - Add actual game details
2. **Export Data** - Get team list for planning
3. **Manage Allergies** - Coordinate catering
4. **Track Equipment** - Check needs
5. **Organize Groups** - By institution
6. **Query Records** - Full team database

## 🚨 Important Notes

- ⚠️ **Validation:** Strict validation prevents bad data entry
- ⚠️ **Overwrite:** Importing again creates new games, doesn't overwrite
- ⚠️ **Backup:** Make a backup of CSV before import
- ⚠️ **Game Jam:** Must select Game Jam before import

## 🎯 Success Indicators

After import you should see:
- ✅ "Successfully imported X teams!" message
- ✅ New games in Admin → Games list
- ✅ Team names in game titles
- ✅ Team member lists populated
- ✅ Contact info in custom fields

## 🔐 Security

- 🔒 Admin authentication required
- 🔒 File type validated (CSV only)
- 🔒 Dangerous characters removed
- 🔒 File size limited (5MB max)
- 🔒 Email format validated

## 📞 Need Help?

1. Check **CSV_IMPORT_TESTING.md** for detailed testing
2. See **INTEGRATION_GUIDE.md** for technical details
3. Check **WORKING_WITH_TEAM_DATA.md** for queries
4. Review backend logs for error details

## 🎬 Example Workflow

```
Monday:
1. Get registration CSV from form
2. Check it's valid format
3. Create new Game Jam: "WinterJam 2025"
4. Go to Admin → Raffle
5. Click "Import from CSV (Save to DB)"
6. Upload CSV
7. Done! Teams in database

Tuesday-Friday:
1. Go to Admin → Games
2. Edit each game with actual title/details
3. Export team list for catering (allergies)
4. Check equipment needs
5. Organize by institution

Event Day:
1. All games published
2. Teams know game names
3. Catering prepared (allergies known)
4. Equipment prepared (knows what needed)
5. Everyone happy!
```

---

**Version:** Quick Reference v1.0

**For admins who need to import CSV files quickly**

**Complete docs available in INTEGRATION_GUIDE.md**
