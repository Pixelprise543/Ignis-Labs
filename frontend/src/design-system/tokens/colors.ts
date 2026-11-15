/**
 * Design system color tokens.
 *
 * Base colors are sourced from the existing Tailwind palette
 * (tailwind.config.js): `void` (charcoal) and `ember` (amber).
 * Semantic tokens map those base values to intentional roles.
 * Light neutrals for text are included because the UI uses a dark
 * theme (void-950 background) and require legible foreground colors.
 */

const charcoal = {
  800: '#111827',
  900: '#0b1120',
  950: '#05070d',
} as const;

const amber = {
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
} as const;

export const colors = {
  charcoal,
  amber,
  semantic: {
    background: charcoal[950],
    surface: charcoal[900],
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textAccent: amber[500],
    border: '#1e293b',
  } as const,
} as const;

export type Colors = typeof colors;
