import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
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
        'group relative flex flex-col bg-white overflow-hidden',
        'border border-gray-100 hover:border-brand-500 transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-black text-brand-500 text-xs font-bold px-2.5 py-1 tracking-wider">
            -{discount}%
          </span>
        )}

        {product.totalStock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold tracking-widest text-xs uppercase">Esgotado</span>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={product.totalStock === 0}
          className={cn(
            'absolute bottom-3 right-3 p-2.5 bg-black text-white',
            'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0',
            'transition-all duration-300 hover:bg-brand-500 hover:text-black',
            product.totalStock === 0 && 'cursor-not-allowed'
          )}
          aria-label="Ver produto"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {product.brand && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          {product.discountPrice ? (
            <>
              <span className="text-base font-bold text-brand-600">
                {formatCurrency(product.discountPrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Gold bottom line on hover */}
      <div className="h-0.5 bg-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  )
}
