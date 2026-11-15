/**
 * Design system responsive breakpoints.
 *
 * Values match the existing Tailwind breakpoint scale.
 */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export type Breakpoints = typeof breakpoints;
