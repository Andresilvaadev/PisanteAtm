import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Package, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/utils/format'
import { Spinner } from '@/components/ui/Spinner'

interface Stats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  lowStockProducts: number
  topProducts: Array<{ id: string; name: string; salesCount: number; revenue: number }>
  recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string }>
}

async function fetchStats(): Promise<Stats> {
  const [prodRes, orderRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, sales_count, price, discount_price, product_variants(stock_quantity)'),
    supabase
      .from('orders')
      .select('id, order_number, total, status, created_at')
      .order('created_at', { ascending: false }),
  ])

  if (prodRes.error) throw prodRes.error
  if (orderRes.error) throw orderRes.error

  const products = prodRes.data ?? []
  const orders = orderRes.data ?? []

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) =>
    (p.product_variants as { stock_quantity: number }[]).some((v) => v.stock_quantity <= 5),
  ).length

  const topProducts = [...products]
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      salesCount: p.sales_count,
      revenue: p.sales_count * (p.discount_price ?? p.price),
    }))

  const recentOrders = orders.slice(0, 10).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
  }))

  return { totalRevenue, totalOrders, pendingOrders, totalProducts, lowStockProducts, topProducts, recentOrders }
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>
  if (!stats) return null

  const cards = [
    { label: 'Receita Total', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total de Pedidos', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pedidos Pendentes', value: stats.pendingOrders, icon: ShoppingBag, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Produtos Cadastrados', value: stats.totalProducts, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Estoque Baixo (≤5)', value: stats.lowStockProducts, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da loja</p>
      </div>

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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Produtos Mais Vendidos</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma venda registrada ainda.</p>
          ) : (
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
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Pedidos Recentes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum pedido registrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">#{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
