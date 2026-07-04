import api from './api'
import type { Order, PagedResult } from '@/types'

export const orderService = {
  getAll: (page = 1, pageSize = 20, status?: number) =>
    api.get<PagedResult<Order>>('/orders', { params: { page, pageSize, status } }).then((r) => r.data),
  getMy: (page = 1, pageSize = 10) =>
    api.get<PagedResult<Order>>('/orders/my', { params: { page, pageSize } }).then((r) => r.data),
  getById: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  create: (addressId: string, notes?: string) =>
    api.post<Order>('/orders', { addressId, notes }).then((r) => r.data),
  updateStatus: (id: string, status: number, comment?: string, trackingCode?: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status, comment, trackingCode }).then((r) => r.data),
}
