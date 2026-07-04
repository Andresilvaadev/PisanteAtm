import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, UserToken } from '@/types'

interface AuthState {
  user: UserToken | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (auth: AuthResponse) => void
  logout: () => void
  isAdmin: () => boolean
  isEmployee: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (auth) =>
        set({
          user: auth.user,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      isAdmin: () => get().user?.roles.includes('Admin') ?? false,
      isEmployee: () =>
        get().user?.roles.some((r) => ['Admin', 'Employee'].includes(r)) ?? false,
    }),
    {
      name: 'pisante-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
