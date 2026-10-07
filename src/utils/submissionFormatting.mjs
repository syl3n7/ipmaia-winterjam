export function formatSubmissionValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => formatSubmissionValue(item))
      .filter((item) => item !== undefined && item !== null && item !== '')
      .join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    return formatSubmissionValue(value.name ?? value.email ?? value.title ?? value.label ?? '');
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
