import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Package, Users, AlertTriangle } from 'lucide-react'
import type { DashboardStats } from '@/types'
import { dashboardService } from '@/services/dashboardService'
import { formatCurrency, formatDate, orderStatusColor } from '@/utils/format'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>
  if (!stats) return null

  const cards = [
    { label: 'Receita Total', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total de Pedidos', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pedidos Pendentes', value: stats.pendingOrders, icon: ShoppingBag, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Produtos', value: stats.totalProducts, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Estoque Baixo', value: stats.lowStockProducts, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'Clientes', value: stats.totalCustomers, icon: Users, color: 'bg-brand-50 text-brand-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da loja</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Produtos Mais Vendidos</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.salesCount} vendas</p>
                </div>
                <span className="text-sm font-bold text-green-600">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Pedidos Recentes</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">#{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{o.customerName} · {formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold">{formatCurrency(o.total)}</span>
                  <Badge className={orderStatusColor[o.status] ?? 'bg-gray-100 text-gray-700'}>
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
