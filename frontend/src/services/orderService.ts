import { supabase } from '@/lib/supabase'
import type { LocalCartItem } from '@/store/cartStore'

export interface SupabaseOrderItem {
  product_id: string
  product_name: string
  variant_id: string | null
  size: string | null
  color: string | null
  unit_price: number
  quantity: number
}

export interface SupabaseOrder {
  id: string
  order_number: string
  items: SupabaseOrderItem[]
  subtotal: number
  total: number
  whatsapp_message: string | null
  status: string
  created_at: string
}

export interface OrdersPage {
  items: SupabaseOrder[]
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function generateOrderNumber(): string {
  const d = new Date()
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PA${yyyymmdd}-${rand}`
}

export function buildWhatsAppMessage(items: LocalCartItem[], total: number, orderNumber: string): string {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string
  const lines = [
    `🛍 *Pedido ${orderNumber}*`,
    '',
    ...items.map((i) => {
      const variant = [i.size, i.color].filter(Boolean).join(' / ')
      return `• ${i.productName}${variant ? ` (${variant})` : ''} — ${i.quantity}x R$ ${i.unitPrice.toFixed(2)}`
    }),
    '',
    `*Total: R$ ${total.toFixed(2)}*`,
    '',
    `IDs: ${items.map((i) => i.productId).join(', ')}`,
  ]
  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${whatsappNumber}?text=${text}`
}

export const orderService = {
  getAll: async (page = 1, pageSize = 20): Promise<OrdersPage> => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const totalCount = count ?? 0
    const totalPages = Math.ceil(totalCount / pageSize)
    return {
      items: (data ?? []) as SupabaseOrder[],
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  },

  create: async (
    cartItems: LocalCartItem[],
    subtotal: number,
    total: number,
    whatsappUrl: string,
    orderNumber?: string,
  ): Promise<SupabaseOrder> => {
    const order_number = orderNumber ?? generateOrderNumber()
    const items: SupabaseOrderItem[] = cartItems.map((i) => ({
      product_id: i.productId,
      product_name: i.productName,
      variant_id: i.variantId ?? null,
      size: i.size ?? null,
      color: i.color ?? null,
      unit_price: i.unitPrice,
      quantity: i.quantity,
    }))

    const { data, error } = await supabase
      .from('orders')
      .insert({ order_number, items, subtotal, total, whatsapp_message: whatsappUrl, status: 'pending' })
      .select()
      .single()

    if (error) throw error
    return data as SupabaseOrder
  },
}
