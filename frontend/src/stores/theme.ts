import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  cycle: () => void
}

const ORDER: ThemeMode[] = ['system', 'light', 'dark']

/** Zustand store for theme preference. Persists to localStorage. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      cycle: () => {
        const idx = ORDER.indexOf(get().mode)
        set({ mode: ORDER[(idx + 1) % ORDER.length] })
      },
    }),
    { name: 'theme' },
  ),
)

/** Apply the data-theme attribute on <html>. Call once at app root. */
export function applyTheme(mode: ThemeMode) {
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }
}
