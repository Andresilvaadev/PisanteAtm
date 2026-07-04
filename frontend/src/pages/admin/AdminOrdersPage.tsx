import { useEffect, useState } from 'react'
import type { Order, PagedResult } from '@/types'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '1', label: 'Aguardando' },
  { value: '2', label: 'Confirmado' },
  { value: '3', label: 'Em Processamento' },
  { value: '4', label: 'Enviado' },
  { value: '5', label: 'Entregue' },
  { value: '6', label: 'Cancelado' },
]

export function AdminOrdersPage() {
  const [result, setResult] = useState<PagedResult<Order> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const load = async (p = 1, status = '') => {
    setLoading(true)
    try {
      const data = await orderService.getAll(p, 20, status ? Number(status) : undefined)
      setResult(data)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1, statusFilter) }, [statusFilter])

  const handleStatusChange = async (orderId: string, newStatus: number) => {
    try {
      await orderService.updateStatus(orderId, newStatus)
      toast.success('Status atualizado')
      load(page, statusFilter)
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500">{result?.totalCount ?? 0} pedidos</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 text-sm px-3 py-2 bg-white focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Pedido</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Cliente</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Data</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {result?.items.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">#{o.orderNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{o.shippingRecipient}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-4 text-right font-bold">{formatCurrency(o.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={orderStatusColor[o.statusLabel] ?? 'bg-gray-100 text-gray-700'}>
                      {orderStatusLabel[o.statusLabel] ?? o.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, Number(e.target.value))}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
                    >
                      <option value={1}>Aguardando</option>
                      <option value={2}>Confirmado</option>
                      <option value={3}>Processando</option>
                      <option value={4}>Enviado</option>
                      <option value={5}>Entregue</option>
                      <option value={6}>Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={!result.hasPreviousPage} onClick={() => load(page - 1, statusFilter)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Anterior</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page}/{result.totalPages}</span>
          <button disabled={!result.hasNextPage} onClick={() => load(page + 1, statusFilter)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Próximo</button>
        </div>
      )}
    </div>
  )
}
