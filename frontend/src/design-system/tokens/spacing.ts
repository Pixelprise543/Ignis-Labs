/**
 * Design system spacing scale.
 *
 * Values are expressed in rem so they scale with the root font size.
 */

export const spacing = {
  'space-xs': '0.25rem',
  'space-sm': '0.5rem',
  'space-md': '1rem',
  'space-lg': '1.5rem',
  'space-xl': '2rem',
  'space-2xl': '3rem',
} as const;

export type Spacing = typeof spacing;
