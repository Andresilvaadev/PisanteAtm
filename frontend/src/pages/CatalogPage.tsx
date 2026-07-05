import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import type { ProductList, Category, PagedResult } from '@/types'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { ProductCard } from '@/components/ui/ProductCard'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'sales', label: 'Mais Vendidos' },
]

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [result, setResult] = useState<PagedResult<ProductList> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const page = Number(params.get('page') ?? 1)
  const search = params.get('search') ?? ''
  const categoryId = params.get('categoryId') ?? ''
  const sortBy = params.get('sortBy') ?? 'newest'
  const minPrice = params.get('minPrice') ?? ''
  const maxPrice = params.get('maxPrice') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      setParams(next)
    },
    [params, setParams]
  )

  useEffect(() => {
    categoryService.getAll().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    productService
      .getAll({
        page,
        pageSize: 12,
        search: search || undefined,
        categoryId: categoryId || undefined,
        sortBy: (sortBy as 'newest' | 'price_asc' | 'price_desc' | 'sales') || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      })
      .then(setResult)
      .finally(() => setLoading(false))
  }, [page, search, categoryId, sortBy, minPrice, maxPrice])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-brand-600 font-semibold tracking-widest uppercase mb-2">Nossa Coleção</p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="font-serif text-4xl font-bold text-gray-900">Catálogo</h1>
            {result && (
              <p className="text-sm text-gray-400 mt-1">{result.totalCount} produtos encontrados</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              className="w-56"
            />
            <select
              value={sortBy}
              onChange={(e) => setParam('sortBy', e.target.value)}
              className="rounded-none border border-gray-200 text-sm px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-700"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="sm:hidden p-2.5 border border-gray-200"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="gold-divider mt-6" />
      </div>

      <div className="flex gap-10">
        {/* Sidebar filters */}
        <aside className={`w-56 flex-shrink-0 space-y-8 ${filterOpen ? 'block' : 'hidden sm:block'}`}>
          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-widest">Categorias</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setParam('categoryId', '')}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    !categoryId
                      ? 'bg-black text-brand-500 font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Todas
                </button>
              </li>
              {categories.filter((c) => c.isActive).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setParam('categoryId', c.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      categoryId === c.id
                        ? 'bg-black text-brand-500 font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {c.name}
                    <span className="text-xs text-gray-400 ml-1">({c.productCount})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-widest">Preço</h3>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setParam('minPrice', e.target.value)}
                className="!px-2 !rounded-none"
              />
              <span className="text-gray-300">—</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setParam('maxPrice', e.target.value)}
                className="!px-2 !rounded-none"
              />
            </div>
          </div>

          {/* Clear filters */}
          {(categoryId || minPrice || maxPrice || search) && (
            <button
              onClick={() => setParams({})}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpar filtros
            </button>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner className="w-8 h-8 text-brand-500" />
            </div>
          ) : result?.items.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-lg mb-6">Nenhum produto encontrado</p>
              <Button variant="outline" onClick={() => setParams({})}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-px bg-gray-100">
                {result?.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {result && result.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-14">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!result.hasPreviousPage}
                    onClick={() => setParam('page', String(page - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-400 tracking-widest">
                    {page} / {result.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!result.hasNextPage}
                    onClick={() => setParam('page', String(page + 1))}
                  >
                    Próximo
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
