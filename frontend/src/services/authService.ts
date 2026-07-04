import api from './api'
import type { AuthResponse } from '@/types'

export const authService = {
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }) => api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  refreshToken: (token: string) =>
    api.post<AuthResponse>('/auth/refresh-token', { token }).then((r) => r.data),

  revokeToken: (token: string) => api.post('/auth/revoke-token', { token }),

  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword, confirmNewPassword }),
}
