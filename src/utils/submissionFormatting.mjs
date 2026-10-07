export function formatSubmissionValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'object' && item !== null ? item.name : String(item))
      .filter((item) => item !== undefined && item !== null && item !== '')
      .join(', ');
  }

  return value ?? '';
}
