import { useEffect, useState } from 'react'
import { ShoppingBag, Package, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'

interface Stats {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  lowStockProducts: number
}

async function fetchStats(): Promise<Stats> {
  const [prodRes, orderRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, product_variants(stock_quantity)'),
    supabase
      .from('orders')
      .select('id, status'),
  ])

  if (prodRes.error) throw prodRes.error
  if (orderRes.error) throw orderRes.error

  const products = prodRes.data ?? []
  const orders = orderRes.data ?? []

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) =>
    (p.product_variants as { stock_quantity: number }[]).some((v) => v.stock_quantity <= 5),
  ).length

  return { totalOrders, pendingOrders, totalProducts, lowStockProducts }
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
    </div>
  )
}
