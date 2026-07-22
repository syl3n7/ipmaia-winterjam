// Validation helpers for server-side checks

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidUsername(username) {
  const value = normalizeString(username);
  if (!value) return { ok: false, reason: 'Username is required' };
  if (value.length < 3) return { ok: false, reason: 'Username must be at least 3 characters' };
  if (value.length > 32) return { ok: false, reason: 'Username must be at most 32 characters' };
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) return { ok: false, reason: 'Username may only contain letters, numbers, dots, underscores, or dashes' };
  return { ok: true, value };
}

function isValidEmail(email) {
  const value = normalizeString(email);
  if (!value) return { ok: false, reason: 'Email is required' };
  if (value.length > 254) return { ok: false, reason: 'Email is too long' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { ok: false, reason: 'Please enter a valid email address' };
  return { ok: true, value };
}

function isStrongPassword(password) {
  if (typeof password !== 'string') return { ok: false, reason: 'Password must be a string' };
  const len = password.length;
  if (len < 14) return { ok: false, reason: 'Password must be at least 14 characters' };
  if (len > 34) return { ok: false, reason: 'Password must be at most 34 characters' };

  const specialMatches = password.match(/[^A-Za-z0-9\s]/g) || [];
  if (specialMatches.length < 2) return { ok: false, reason: 'Password must contain at least 2 special characters' };

  if (!/[A-Z]/.test(password)) return { ok: false, reason: 'Password must include an uppercase letter' };
  if (!/[a-z]/.test(password)) return { ok: false, reason: 'Password must include a lowercase letter' };
  if (!/[0-9]/.test(password)) return { ok: false, reason: 'Password must include a number' };

  return { ok: true };
}

module.exports = { isStrongPassword, isValidUsername, isValidEmail };
