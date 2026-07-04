import { useEffect, useState } from 'react'
import { orderService, type SupabaseOrder, type OrdersPage } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/format'
import { Spinner } from '@/components/ui/Spinner'

export function AdminOrdersPage() {
  const [result, setResult] = useState<OrdersPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const data = await orderService.getAll(p, 20)
      setResult(data)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500">{result?.totalCount ?? 0} pedidos registrados via WhatsApp</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (result?.items.length ?? 0) === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Nenhum pedido ainda</p>
            <p className="text-sm mt-1">Os pedidos aparecem aqui após o cliente finalizar pelo WhatsApp.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Pedido</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Itens</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Data</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {result!.items.map((o: SupabaseOrder) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">#{o.order_number}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="space-y-0.5">
                      {o.items.map((item, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          {item.quantity}× {item.product_name}
                          {item.size ? ` (${[item.size, item.color].filter(Boolean).join('/')})` : ''}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(o.created_at)}</td>
                  <td className="px-6 py-4 text-right font-bold">{formatCurrency(o.total)}</td>
                  <td className="px-6 py-4 text-center">
                    {o.whatsapp_message && (
                      <a
                        href={o.whatsapp_message}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline font-medium"
                      >
                        WhatsApp ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={!result.hasPreviousPage}
            onClick={() => load(page - 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">{page}/{result.totalPages}</span>
          <button
            disabled={!result.hasNextPage}
            onClick={() => load(page + 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  )
}
