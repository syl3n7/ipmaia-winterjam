// Validation helpers for server-side checks

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

module.exports = { isStrongPassword };
