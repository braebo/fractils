/**
 * Clamps a value between a min and max.
 */
export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);
