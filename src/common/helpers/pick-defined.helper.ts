export function pickDefined<T extends object>(source: T, keys: (keyof T)[]): Partial<T> {
  return keys.reduce((acc, key) => {
    const value = source[key];
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {} as Partial<T>);
}
