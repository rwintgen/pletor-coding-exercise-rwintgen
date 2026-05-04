/**
 * Color tokens. Neutrals + primary/accent resolve to CSS variables defined in
 * index.css so they automatically swap when the system switches to dark mode
 * (`prefers-color-scheme: dark`). Semantic palettes (success/warning/error)
 * stay as hex because they're brand-stable across modes.
 */
export const colors = {
  primary: {
    50: 'var(--primary-50)',
    100: 'var(--primary-100)',
    400: 'var(--primary-400)',
    500: 'var(--primary-500)',
    600: 'var(--primary-600)',
    700: 'var(--primary-700)',
  },
  accent: {
    400: 'var(--accent-400)',
    500: 'var(--accent-500)',
    600: 'var(--accent-600)',
  },
  neutral: {
    0: 'var(--neutral-0)',
    50: 'var(--neutral-50)',
    100: 'var(--neutral-100)',
    150: 'var(--neutral-150)',
    200: 'var(--neutral-200)',
    300: 'var(--neutral-300)',
    400: 'var(--neutral-400)',
    500: 'var(--neutral-500)',
    600: 'var(--neutral-600)',
    700: 'var(--neutral-700)',
    800: 'var(--neutral-800)',
    900: 'var(--neutral-900)',
    950: 'var(--neutral-950)',
  },
  success: { 50: '#ecfdf5', 500: '#10b981', 700: '#047857' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
  error: { 50: 'var(--error-50)', 500: 'var(--error-500)', 600: 'var(--error-600)', 700: 'var(--error-700)' },
} as const

export const gradients = {
  brand: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
  brandSubtle: 'linear-gradient(135deg, #eef2ff 0%, #fae8ff 100%)',
  surface: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)',
  hero: 'radial-gradient(circle at 20% 0%, rgba(99,102,241,0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(236,72,153,0.06), transparent 50%)',
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '72px',
} as const

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.5rem',
  },
  fontWeight: { medium: 500, semibold: 600, bold: 700 },
} as const

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  '2xl': '24px',
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px rgba(24,24,27,0.04)',
  sm: '0 1px 3px rgba(24,24,27,0.06), 0 1px 2px rgba(24,24,27,0.04)',
  md: '0 4px 12px -2px rgba(24,24,27,0.08), 0 2px 6px -2px rgba(24,24,27,0.04)',
  lg: '0 12px 28px -8px rgba(24,24,27,0.12), 0 4px 10px -4px rgba(24,24,27,0.06)',
  xl: '0 24px 50px -12px rgba(24,24,27,0.18), 0 8px 16px -8px rgba(24,24,27,0.08)',
  glow: '0 0 0 4px rgba(99,102,241,0.18)',
  glowAccent: '0 0 0 4px rgba(236,72,153,0.18)',
  brand: '0 10px 30px -10px rgba(99,102,241,0.45)',
} as const

export const transitions = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '450ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const

