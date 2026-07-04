import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react'
import type { ProductList, Category } from '@/types'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { ProductCard } from '@/components/ui/ProductCard'
import { Spinner } from '@/components/ui/Spinner'

export function HomePage() {
  const [featured, setFeatured] = useState<ProductList[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ProductList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getFeatured(8),
      categoryService.getAll(),
      productService.getAll({ page: 1, pageSize: 12 }),
    ])
      .then(([feat, cats, paged]) => {
        setFeatured(feat)
        setCategories(cats.filter((c) => c.isActive).slice(0, 6))
        setProducts(paged.items as ProductList[])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-brand-300">
            ✨ Nova Coleção Disponível
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
            Vista-se com
            <br />
            <span className="text-brand-400">Atitude</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl">
            Calçados e roupas com estilo e conforto. Encontre o look perfeito para cada momento.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/catalogo" className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 px-7 py-3.5 text-base bg-brand-500 hover:bg-brand-400 text-white">
              Ver Catálogo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/catalogo?featured=true" className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 px-7 py-3.5 text-base border-2 border-white/30 text-white hover:bg-white/10">
              Destaques
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: 'Frete Grátis', desc: 'Nas compras acima de R$ 199' },
            { icon: Shield, title: 'Compra Segura', desc: 'Site protegido com SSL' },
            { icon: RotateCcw, title: 'Troca Fácil', desc: 'Até 30 dias para trocar' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900">Destaques</h2>
          <Link to="/catalogo?featured=true" className="text-sm font-medium text-brand-600 hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-10 h-10" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-20">Nenhum produto em destaque ainda</p>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">Categorias</h2>
            <Link to="/catalogo" className="text-sm font-medium text-brand-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoryId=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                      <span className="text-2xl">👟</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-600 text-center transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900">Produtos</h2>
          <Link to="/catalogo" className="text-sm font-medium text-brand-600 hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-10 h-10" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-20">Nenhum produto disponível ainda</p>
        )}
      </section>
    </div>
  )
}
