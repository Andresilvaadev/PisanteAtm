import api from './api'
import type { PagedResult, Product, ProductList, ProductQueryParams } from '@/types'

export const productService = {
  getAll: (params?: ProductQueryParams) =>
    api.get<PagedResult<ProductList>>('/products', { params }).then((r) => r.data),

  getFeatured: (count = 8) =>
    api.get<ProductList[]>('/products/featured', { params: { count } }).then((r) => r.data),

  getById: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  getBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`).then((r) => r.data),

  getLowStock: (threshold = 5) =>
    api.get<ProductList[]>('/products/low-stock', { params: { threshold } }).then((r) => r.data),

  create: (data: unknown) => api.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: unknown) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/products/${id}`),

  uploadImage: (productId: string, file: File, isPrimary = false) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<{ url: string }>(`/products/${productId}/images?isPrimary=${isPrimary}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteImage: (imageId: string) => api.delete(`/products/images/${imageId}`),
}
