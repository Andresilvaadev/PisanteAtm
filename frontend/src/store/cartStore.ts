import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface LocalCartItem {
  id: string
  productId: string
  productName: string
  productImageUrl?: string
  productSlug: string
  variantId?: string
  size?: string
  color?: string
  unitPrice: number
  stockQuantity: number
  quantity: number
  subtotal: number
}

interface LocalCart {
  items: LocalCartItem[]
  total: number
  itemCount: number
}

function buildCart(items: LocalCartItem[]): LocalCart {
  return {
    items,
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

interface CartState {
  cart: LocalCart | null
  addItem: (info: Omit<LocalCartItem, 'id' | 'subtotal'>) => void
  updateItem: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,

      addItem: (info) => {
        const items = get().cart?.items ?? []

        const existingIdx = items.findIndex(
          (i) => i.productId === info.productId && i.variantId === info.variantId,
        )

        let newItems: LocalCartItem[]
        if (existingIdx >= 0) {
          const existing = items[existingIdx]
          const newQty = Math.min(existing.quantity + info.quantity, existing.stockQuantity)
          newItems = items.map((item, idx) =>
            idx === existingIdx
              ? { ...item, quantity: newQty, subtotal: item.unitPrice * newQty }
              : item,
          )
          toast.success('Quantidade atualizada no carrinho!')
        } else {
          const newItem: LocalCartItem = {
            ...info,
            id: crypto.randomUUID(),
            subtotal: info.unitPrice * info.quantity,
          }
          newItems = [...items, newItem]
          toast.success('Produto adicionado ao carrinho!')
        }

        set({ cart: buildCart(newItems) })
      },

      updateItem: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        const items = (get().cart?.items ?? []).map((item) => {
          if (item.id !== itemId) return item
          const newQty = Math.min(quantity, item.stockQuantity)
          return { ...item, quantity: newQty, subtotal: item.unitPrice * newQty }
        })
        set({ cart: buildCart(items) })
      },

      removeItem: (itemId) => {
        const items = (get().cart?.items ?? []).filter((i) => i.id !== itemId)
        set({ cart: items.length > 0 ? buildCart(items) : null })
        toast.success('Item removido')
      },

      clearCart: () => set({ cart: null }),
    }),
    {
      name: 'pisante-cart',
      partialize: (s) => ({ cart: s.cart }),
    },
  ),
)
