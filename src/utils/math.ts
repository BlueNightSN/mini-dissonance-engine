export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeRange(value: number, min: number, max: number): number {
  if (min === max) {
    return 0;
  }

  return (value - min) / (max - min);
}
