import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isAuthenticated) {
    navigate('/login', { state: { from: location.pathname }, replace: true })
  }

  return { isAuthenticated }
}

export function useRequireAdmin() {
  const { isAuthenticated, isEmployee } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated || !isEmployee()) {
    navigate('/', { replace: true })
  }

  return { isAuthenticated }
}
