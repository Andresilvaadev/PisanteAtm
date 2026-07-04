import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: Session | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) =>
    set({ session, isAuthenticated: !!session, isLoading: false }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, isAuthenticated: false })
  },
}))

// Inicializa sessão ao carregar (Supabase persiste no localStorage automaticamente)
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.getState().setSession(data.session)
})

// Mantém sincronizado com mudanças de auth (login, logout, refresh de token)
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session)
})
