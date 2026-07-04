import api from './api'
import type { Cart } from '@/types'

export const cartService = {
  get: () => api.get<Cart>('/cart').then((r) => r.data),
  addItem: (productId: string, variantId?: string, quantity = 1) =>
    api.post<Cart>('/cart/items', { productId, variantId, quantity }).then((r) => r.data),
  updateItem: (itemId: string, quantity: number) =>
    api.put<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId: string) =>
    api.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data),
  clear: () => api.delete('/cart'),
}
