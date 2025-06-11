export function parseJsonArray(value: unknown): string[] {
  if (typeof value !== 'string') return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}
