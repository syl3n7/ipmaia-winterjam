function normalizeJamSponsorEntries(entries = []) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter(entry => entry && entry.sponsor_id && entry.is_active !== false)
    .map(entry => ({
      ...entry,
      sponsor_id: Number(entry.sponsor_id),
      display_order: Number(entry.display_order ?? 9999),
      is_active: entry.is_active !== false
    }))
    .filter(entry => Number.isFinite(entry.sponsor_id) && entry.sponsor_id > 0)
    .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999));
}

function pickJamSponsorsForDisplay(jamSponsors = [], fallbackSponsors = []) {
  const normalizedJam = normalizeJamSponsorEntries(jamSponsors).filter(item => item.is_active);
  if (normalizedJam.length > 0) {
    return normalizedJam;
  }

  return Array.isArray(fallbackSponsors) ? fallbackSponsors : [];
}

module.exports = {
  normalizeJamSponsorEntries,
  pickJamSponsorsForDisplay,
};
