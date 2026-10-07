export function createThemeEntry(text) {
  const cleaned = String(text ?? '').trim();
  if (!cleaned) return null;

  return {
    text: cleaned,
    weight: 1,
    enabled: true,
  };
}
