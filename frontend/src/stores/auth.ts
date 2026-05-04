import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '../api/client'

interface AuthState {
  token: string | null
  user: UserInfo | null
  setAuth: (token: string, user: UserInfo) => void
  setUser: (user: UserInfo | null) => void
  clear: () => void
}

/**
 * Zustand store for authentication state.
 * Persists token to localStorage so the session survives page reloads.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
    }),
    { name: 'auth' },
  ),
)
