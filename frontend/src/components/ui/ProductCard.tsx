import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import type { ProductList } from '@/types'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ProductCardProps {
  product: ProductList
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const navigate = useNavigate()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(`/produto/${product.slug}`)
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <Link
      to={`/produto/${product.slug}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm',
        'border border-gray-100 hover:shadow-md transition-shadow duration-300',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}

        {product.totalStock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Esgotado</span>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={product.totalStock === 0}
          className={cn(
            'absolute bottom-2 right-2 p-2.5 rounded-xl bg-white shadow-md',
            'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0',
            'transition-all duration-200 hover:bg-brand-600 hover:text-white',
            product.totalStock === 0 && 'cursor-not-allowed opacity-0'
          )}
          aria-label="Ver produto"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {product.brand && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{product.brand}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.averageRating.toFixed(1)}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          {product.discountPrice ? (
            <>
              <span className="text-lg font-bold text-brand-600">
                {formatCurrency(product.discountPrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
