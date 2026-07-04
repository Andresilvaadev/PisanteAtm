import api from './api'
import type { Category } from '@/types'

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
  getById: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string; isActive?: boolean; displayOrder?: number }) =>
    api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  uploadImage: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<{ url: string }>(`/categories/${id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
