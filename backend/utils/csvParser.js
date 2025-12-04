/**
 * CSV Parser and Validator for Team Registration Data
 * Expected columns from WinterJam 2025 registration form
 */

// Define expected CSV structure
const EXPECTED_COLUMNS = {
  timestamp: ['carimbo de data/hora', 'timestamp'],
  teamName: ['nome da equipa', 'team name', 'team'],
  teamSize: ['número de elementos da equipa', 'team size', 'number of members'],
  members: ['nome dos membros da equipa', 'team members', 'members'],
  emailContact: ['email de contacto principal', 'email', 'contact email'],
  phoneContact: ['telemóvel de contacto', 'phone', 'contact phone'],
  institution: ['instituição / curso', 'institution', 'course'],
  fullAttendance: ['equipa vai estar presente durante todo o evento', 'full attendance'],
  previousParticipation: ['ja participaram anteriormente', 'previous participation'],
  equipmentRequest: ['vão precisar de requisitar equipamento', 'equipment request'],
  howFound: ['como souberam do evento', 'how found event'],
  dinners: ['equipa vai comparecer aos 2 jantares', 'dinner attendance'],
  fridayDinner: ['opção do jantar de sexta', 'friday dinner option'],
  allergies: ['alergias ou restrições alimentares', 'allergies or restrictions'],
  allergiesDetails: ['especificar quais', 'allergy details'],
  diet: ['dieta específica', 'specific diet'],
  photoConsent: ['autorizam o uso de fotos', 'photo consent'],
  regulationAccept: ['leram e aceitaram o regulamento', 'regulation accept']
};

/**
 * Parse CSV text and extract team data
 * @param {string} csvText - Raw CSV text
 * @returns {Object} { teams: Array, errors: Array }
 */
function parseCSV(csvText) {
  const errors = [];
  const teams = [];
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    errors.push('CSV file is empty or has no data rows');
    return { teams, errors };
  }

  // Parse header line
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  
  if (headers.length === 0) {
    errors.push('Could not parse CSV header');
    return { teams, errors };
  }

  // Map column indices to field names
  const columnMap = mapHeaders(headers, errors);
  if (Object.keys(columnMap).length === 0) {
    errors.push('CSV headers do not match expected format');
    return { teams, errors };
  }

  // Parse data rows
  const seenNames = new Set();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const fields = parseCSVLine(line);
    if (fields.length === 0) continue;

    try {
      const teamData = extractTeamData(fields, columnMap, i + 1);
      
      // Validate team data
      const validationErrors = validateTeamData(teamData, i + 1);
      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
        continue;
      }

      // Check for duplicates
      if (seenNames.has(teamData.teamName.toLowerCase())) {
        errors.push(`Row ${i + 1}: Duplicate team "${teamData.teamName}" found, skipping`);
        continue;
      }

      seenNames.add(teamData.teamName.toLowerCase());
      teams.push({
        id: i - 1,
        ...teamData
      });
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  return { teams, errors };
}

/**
 * Parse a single CSV line handling quoted fields with commas
 * @param {string} line - CSV line
 * @returns {Array} Parsed fields
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
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
}

/**
 * Map CSV headers to field names
 * @param {Array} headers - CSV headers
 * @param {Array} errors - Errors array to populate
 * @returns {Object} Map of field names to column indices
 */
function mapHeaders(headers, errors) {
  const columnMap = {};

  Object.entries(EXPECTED_COLUMNS).forEach(([fieldName, variations]) => {
    const foundIndex = headers.findIndex(header => {
      const normalized = header.toLowerCase().trim();
      return variations.some(v => normalized.includes(v));
    });

    if (foundIndex >= 0) {
      columnMap[fieldName] = foundIndex;
    }
  });

  // Check for at least minimum required columns
  const requiredFields = ['teamName', 'members', 'emailContact'];
  const missingFields = requiredFields.filter(field => !columnMap[field]);
  
  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(', ')}`);
  }

  return columnMap;
}

/**
 * Extract team data from a CSV row
 * @param {Array} fields - CSV fields
 * @param {Object} columnMap - Column index mapping
 * @param {number} rowNumber - Row number for error reporting
 * @returns {Object} Team data
 */
function extractTeamData(fields, columnMap, rowNumber) {
  const get = (fieldName) => {
    const index = columnMap[fieldName];
    return index !== undefined && index < fields.length ? fields[index] : '';
  };

  // Parse team members - split by comma, semicolon, or newline
  const memberString = get('members');
  const members = memberString
    .split(/[,;\n\r]+/)  // Split by comma, semicolon, newline, or carriage return
    .map(m => m.trim())
    .filter(m => m.length > 0);

  // Parse team size
  const teamSizeStr = get('teamSize');
  const teamSizeMatch = teamSizeStr.match(/\d+/);
  const teamSize = teamSizeMatch ? parseInt(teamSizeMatch[0]) : members.length;

  return {
    teamName: get('teamName'),
    teamSize: teamSize,
    members: members,
    emailContact: get('emailContact'),
    phoneContact: get('phoneContact'),
    institution: get('institution'),
    fullAttendance: get('fullAttendance').toLowerCase().includes('sim') || get('fullAttendance').toLowerCase().includes('yes'),
    previousParticipation: get('previousParticipation').toLowerCase().includes('sim') || get('previousParticipation').toLowerCase().includes('yes'),
    equipmentRequest: get('equipmentRequest'),
    howFound: get('howFound'),
    dinnerAttendance: get('dinners'),
    fridayDinner: get('fridayDinner'),
    allergies: get('allergies').toLowerCase().includes('sim') || get('allergies').toLowerCase().includes('yes'),
    allergiesDetails: get('allergiesDetails'),
    specificDiet: get('diet'),
    photoConsent: get('photoConsent').toLowerCase().includes('sim') || get('photoConsent').toLowerCase().includes('yes'),
    regulationAccept: get('regulationAccept').toLowerCase().includes('sim') || get('regulationAccept').toLowerCase().includes('yes'),
    timestamp: get('timestamp')
  };
}

/**
 * Validate team data
 * @param {Object} teamData - Team data to validate
 * @param {number} rowNumber - Row number for error reporting
 * @returns {Array} Array of validation error messages
 */
function validateTeamData(teamData, rowNumber) {
  const errors = [];

  // Team name validation
  if (!teamData.teamName || teamData.teamName.trim().length === 0) {
    errors.push(`Row ${rowNumber}: Team name is required`);
  } else if (teamData.teamName.length > 100) {
    errors.push(`Row ${rowNumber}: Team name is too long (max 100 characters)`);
  }

  // Members validation
  if (!teamData.members || teamData.members.length === 0) {
    errors.push(`Row ${rowNumber}: At least one team member is required`);
  } else if (teamData.members.length > 20) {
    errors.push(`Row ${rowNumber}: Too many team members (max 20)`);
  } else {
    teamData.members.forEach((member, idx) => {
      if (member.length > 150) {
        errors.push(`Row ${rowNumber}: Member #${idx + 1} name is too long (max 150 characters)`);
      }
      if (!member.match(/^[a-zA-Z\s\-'.àáâãäåèéêëìíîïòóôõöùúûüýÿçñ]+$/i)) {
        errors.push(`Row ${rowNumber}: Member #${idx + 1} name contains invalid characters`);
      }
    });
  }

  // Email validation
  if (teamData.emailContact && !isValidEmail(teamData.emailContact)) {
    errors.push(`Row ${rowNumber}: Invalid email address "${teamData.emailContact}"`);
  } else if (!teamData.emailContact) {
    errors.push(`Row ${rowNumber}: Email contact is required`);
  }

  // Team size validation
  if (teamData.teamSize < 1 || teamData.teamSize > 20) {
    errors.push(`Row ${rowNumber}: Team size must be between 1 and 20`);
  }

  // Regulation acceptance
  if (!teamData.regulationAccept) {
    errors.push(`Row ${rowNumber}: Team must accept regulations`);
  }

  return errors;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize team name for display
 * @param {string} name - Team name
 * @returns {string} Sanitized name
 */
function sanitizeTeamName(name) {
  return name
    .trim()
    .substring(0, 100)
    .replace(/[<>"]/g, '');
}

/**
 * Sanitize member names
 * @param {Array} members - Array of member names
 * @returns {Array} Sanitized member names
 */
function sanitizeMemberNames(members) {
  return members
    .map(m => m.trim().substring(0, 150).replace(/[<>"]/g, ''))
    .filter(m => m.length > 0);
}

module.exports = {
  parseCSV,
  parseCSVLine,
  mapHeaders,
  extractTeamData,
  validateTeamData,
  isValidEmail,
  sanitizeTeamName,
  sanitizeMemberNames
};
