import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Order, PagedResult } from '@/types'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ShoppingBag } from 'lucide-react'

export function MyOrdersPage() {
  const [result, setResult] = useState<PagedResult<Order> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = (p = 1) => {
    setLoading(true)
    orderService.getMy(p).then(setResult).finally(() => setLoading(false))
    setPage(p)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>

  if (!result?.items.length) {
    return (
      <div className="text-center py-24 space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Nenhum pedido ainda</h2>
        <Link to="/catalogo" className="text-brand-600 font-medium hover:underline">Ir às compras</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900">Meus Pedidos</h2>
      {result.items.map((o) => (
        <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="font-bold text-gray-900">#{o.orderNumber}</p>
              <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-brand-600">{formatCurrency(o.total)}</span>
              <Badge className={orderStatusColor[o.statusLabel] ?? 'bg-gray-100 text-gray-700'}>
                {orderStatusLabel[o.statusLabel] ?? o.statusLabel}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            {o.items.slice(0, 3).map((item) => (
              <p key={item.id} className="text-sm text-gray-600">
                {item.productName} {item.variantSize && `(${item.variantSize})`} × {item.quantity}
              </p>
            ))}
            {o.items.length > 3 && (
              <p className="text-xs text-gray-400">+{o.items.length - 3} itens</p>
            )}
          </div>
        </div>
      ))}

      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={!result.hasPreviousPage} onClick={() => load(page - 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Anterior</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page}/{result.totalPages}</span>
          <button disabled={!result.hasNextPage} onClick={() => load(page + 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Próximo</button>
        </div>
      )}
    </div>
  )
}
