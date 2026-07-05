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
    <div>
      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Gold radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-36 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 border border-brand-500/40 rounded-full px-5 py-2 text-xs font-medium text-brand-400 tracking-widest uppercase">
            ✦ Nova Coleção Disponível
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-none">
            Vista-se com
            <br />
            <span className="text-brand-500">Atitude</span>
          </h1>

          <div className="gold-divider w-24 mx-auto" />

          <p className="text-gray-400 max-w-md text-lg leading-relaxed">
            Calçados e roupas com estilo e conforto. Encontre o look perfeito para cada momento.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-brand-500 text-black font-semibold tracking-wide px-8 py-3.5 hover:bg-brand-600 hover:text-white transition-all duration-200"
            >
              Ver Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/catalogo?featured=true"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold tracking-wide px-8 py-3.5 hover:border-brand-500 hover:text-brand-500 transition-all duration-200"
            >
              Destaques
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-black border-t border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-800">
            {[
              { icon: Truck, title: 'Frete Grátis', desc: 'Nas compras acima de R$ 199' },
              { icon: Shield, title: 'Compra Segura', desc: 'Site protegido com SSL' },
              { icon: RotateCcw, title: 'Troca Fácil', desc: 'Até 30 dias para trocar' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-8 py-6">
                <Icon className="w-6 h-6 text-brand-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm tracking-wide">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-brand-600 font-semibold tracking-widest uppercase mb-2">Seleção Especial</p>
            <h2 className="font-serif text-3xl font-bold text-gray-900">Destaques</h2>
          </div>
          <Link to="/catalogo?featured=true" className="text-sm font-medium text-gray-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8 text-brand-500" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
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
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs text-brand-600 font-semibold tracking-widest uppercase mb-2">Explorar</p>
                <h2 className="font-serif text-3xl font-bold text-gray-900">Categorias</h2>
              </div>
              <Link to="/catalogo" className="text-sm font-medium text-gray-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalogo?categoryId=${cat.id}`}
                  className="group flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 hover:border-brand-500 transition-all duration-200"
                >
                  <div className="w-14 h-14 overflow-hidden bg-gray-50">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <span className="text-brand-500 text-xl">✦</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-600 text-center tracking-wider uppercase transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-brand-600 font-semibold tracking-widest uppercase mb-2">Coleção</p>
            <h2 className="font-serif text-3xl font-bold text-gray-900">Todos os Produtos</h2>
          </div>
          <Link to="/catalogo" className="text-sm font-medium text-gray-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8 text-brand-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-20">Nenhum produto disponível ainda</p>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-black py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="gold-divider mb-10" />
          <h2 className="font-serif text-4xl font-bold text-white mb-4">
            Estilo que fala por si
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Explore nossa coleção completa e encontre o par perfeito para cada ocasião.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-500 text-black font-semibold tracking-wide px-10 py-4 hover:bg-brand-600 hover:text-white transition-all duration-200"
          >
            Explorar Catálogo <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="gold-divider mt-10" />
        </div>
      </section>
    </div>
  )
}
