import { useAuthStore } from '@/store/authStore'

export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore()
  return { isAuthenticated }
}

export function useRequireAdmin() {
  const { isAuthenticated } = useAuthStore()
  return { isAuthenticated }
}
