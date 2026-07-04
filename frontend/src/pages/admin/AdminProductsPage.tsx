import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, ImagePlus } from 'lucide-react'
import type { ProductList } from '@/types'
import { productService } from '@/services/productService'
import { formatCurrency } from '@/utils/format'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductList[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const loadProducts = async (p = 1) => {
    setLoading(true)
    try {
      const result = await productService.getAll({ page: p, pageSize: 20 })
      setProducts(result.items)
      setTotal(result.totalCount)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir "${name}"?`)) return
    try {
      await productService.delete(id)
      toast.success('Produto excluído')
      loadProducts(page)
    } catch {
      toast.error('Erro ao excluir produto')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500">{total} produtos cadastrados</p>
        </div>
        <Link to="/admin/produtos/novo" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-all">
          <Plus className="w-4 h-4" /> Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Produto</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Categoria</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Preço</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Estoque</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.primaryImageUrl ? (
                          <img src={p.primaryImageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{p.name}</p>
                        {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.categoryName}</td>
                  <td className="px-6 py-4 text-right">
                    {p.discountPrice ? (
                      <div>
                        <span className="font-bold text-brand-600">{formatCurrency(p.discountPrice)}</span>
                        <span className="text-xs text-gray-400 line-through block">{formatCurrency(p.price)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatCurrency(p.price)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${p.totalStock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {p.totalStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.isFeatured ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.isFeatured ? 'Destaque' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button title="Imagens" className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors">
                        <ImagePlus className="w-4 h-4" />
                      </button>
                      <Link to={`/admin/produtos/${p.id}/editar`} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
