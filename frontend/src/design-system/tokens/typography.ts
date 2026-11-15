/**
 * Design system typography tokens.
 */

export const typography = {
  fontFamily: {
    sans:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  } as const,
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  } as const,
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  } as const,
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  } as const,
} as const;

export type Typography = typeof typography;
