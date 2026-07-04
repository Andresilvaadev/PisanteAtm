import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, ChevronLeft, Package } from 'lucide-react'
import type { Product, ProductVariant, ProductImage } from '@/types'
import { productService } from '@/services/productService'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    if (!slug) return
    productService.getBySlug(slug).then((p) => {
      setProduct(p)

      const primary = p.images.find((i) => i.isPrimary) ?? p.images[0]

      const firstWithColor = p.variants.find((v) => v.color)
      if (firstWithColor?.color) {
        const color = firstWithColor.color
        setSelectedColor(color)

        // Prefere a primeira foto específica dessa cor, senão usa a principal
        const colorImg = p.images.find((img) => img.color === color)
        setSelectedImageId((colorImg ?? primary)?.id ?? null)

        const firstVariant =
          p.variants.find((v) => v.color === color && v.stockQuantity > 0) ??
          p.variants.find((v) => v.color === color) ??
          null
        setSelectedVariant(firstVariant)
      } else {
        setSelectedImageId(primary?.id ?? null)
        if (p.variants.length > 0) {
          const first = p.variants.find((v) => v.stockQuantity > 0) ?? p.variants[0]
          setSelectedVariant(first ?? null)
        }
      }
    }).catch(() => navigate('/404')).finally(() => setLoading(false))
  }, [slug, navigate])

  // Cores únicas do produto (em ordem de aparição)
  const uniqueColors: string[] = product
    ? [...new Set(product.variants.filter((v) => v.color).map((v) => v.color!))]
    : []

  const hasColors = uniqueColors.length > 0

  // Imagens visíveis para a cor selecionada:
  // - fotos sem cor: aparecem em todas as cores
  // - fotos com cor: aparecem apenas quando aquela cor está selecionada
  const visibleImages: ProductImage[] = product
    ? hasColors && selectedColor
      ? product.images.filter((img) => !img.color || img.color === selectedColor)
      : product.images
    : []

  // Se a galeria filtrada não tem nenhuma foto específica da cor, mostra todas sem cor
  const displayImages = visibleImages.length > 0 ? visibleImages : (product?.images ?? [])

  const selectedImage = displayImages.find((img) => img.id === selectedImageId) ?? displayImages[0]

  // Variantes filtradas pela cor selecionada
  const variantsForColor: ProductVariant[] = product
    ? hasColors && selectedColor
      ? product.variants.filter((v) => v.color === selectedColor)
      : product.variants
    : []

  const handleColorSelect = (color: string) => {
    if (!product) return
    setSelectedColor(color)
    setQuantity(1)

    // Foto: prefere a primeira específica dessa cor, senão a primeira genérica (sem cor)
    const colorImg = product.images.find((img) => img.color === color)
    const genericImg = product.images.find((img) => !img.color)
    setSelectedImageId((colorImg ?? genericImg ?? product.images[0])?.id ?? null)

    // Tamanho: primeiro em estoque, ou primeiro se todos esgotados
    const ofColor = product.variants.filter((v) => v.color === color)
    const first = ofColor.find((v) => v.stockQuantity > 0) ?? ofColor[0] ?? null
    setSelectedVariant(first)
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.variants.length > 0 && !selectedVariant) return
    const primaryImg = product.images.find((i) => i.isPrimary) ?? product.images[0]
    setAdding(true)
    addItem({
      productId: product.id,
      productName: product.name,
      productImageUrl: primaryImg?.url,
      productSlug: product.slug,
      variantId: selectedVariant?.id,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      unitPrice: product.discountPrice ?? product.price,
      stockQuantity: selectedVariant?.stockQuantity ?? product.totalStock,
      quantity,
    })
    setAdding(false)
  }

  const stock = selectedVariant?.stockQuantity ?? product?.totalStock ?? 0

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>
  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Galeria */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
            {selectedImage?.url ? (
              <img
                key={selectedImage.id}
                src={selectedImage.url}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>

          {displayImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {displayImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  className={cn(
                    'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors',
                    selectedImageId === img.id
                      ? 'border-brand-500'
                      : 'border-transparent hover:border-gray-300',
                  )}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">
                {product.brand}
              </p>
            )}
            <h1 className="text-3xl font-black text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{product.categoryName}</p>
          </div>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      'w-4 h-4',
                      s <= Math.round(product.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount} avaliações)</span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-4xl font-black text-brand-600">{formatCurrency(product.discountPrice)}</span>
                <span className="text-xl text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-0.5 rounded-lg">
                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-4xl font-black text-gray-900">{formatCurrency(product.price)}</span>
            )}
          </div>

          {/* Seletor de COR */}
          {hasColors && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Cor:{' '}
                {selectedColor && (
                  <span className="font-black text-brand-600 ml-1">{selectedColor}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  const hasStock = product.variants.some(
                    (v) => v.color === color && v.stockQuantity > 0,
                  )
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        'px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all',
                        selectedColor === color
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-brand-400',
                        !hasStock && 'opacity-40 cursor-not-allowed line-through',
                      )}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Seletor de TAMANHO — filtrado pela cor */}
          {variantsForColor.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Tamanho:{' '}
                {selectedVariant && (
                  <span className="font-black text-brand-600 ml-1">{selectedVariant.size}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {variantsForColor.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                    disabled={v.stockQuantity === 0}
                    className={cn(
                      'w-14 h-14 rounded-xl border-2 text-sm font-semibold transition-all',
                      selectedVariant?.id === v.id
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-gray-200 text-gray-700 hover:border-brand-400',
                      v.stockQuantity === 0 && 'opacity-40 cursor-not-allowed line-through',
                    )}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Quantidade</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold disabled:opacity-40"
              >
                +
              </button>
              <span className="text-sm text-gray-400 ml-2">{stock} disponíveis</span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            loading={adding}
            disabled={stock === 0 || (product.variants.length > 0 && !selectedVariant)}
            className="w-full gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {stock === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
          </Button>

          {product.description && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
