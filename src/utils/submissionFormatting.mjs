export function formatSubmissionValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'object' && item !== null ? item.name : String(item))
      .filter((item) => item !== undefined && item !== null && item !== '')
      .join(', ');
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ');
  }

  return value ?? '';
}
