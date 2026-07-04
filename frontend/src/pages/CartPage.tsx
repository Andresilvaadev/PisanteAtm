import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/Button'

export function CartPage() {
  const { cart, updateItem, removeItem } = useCartStore()
  const navigate = useNavigate()

  const items = cart?.items ?? []

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-2xl font-black text-gray-900">Carrinho vazio</h2>
        <p className="text-gray-500">Adicione produtos para continuar comprando</p>
        <Link to="/catalogo" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border-2 border-brand-600 text-brand-600 hover:bg-brand-50 transition-all">
          <ArrowLeft className="w-4 h-4" /> Ver Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
                {item.size && <p className="text-sm text-gray-500">Tamanho: {item.size}</p>}
                {item.color && <p className="text-sm text-gray-500">Cor: {item.color}</p>}
                <p className="font-bold text-brand-600 mt-1">{formatCurrency(item.unitPrice)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 font-bold"
                    >−</button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 font-bold disabled:opacity-40"
                    >+</button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-4">
            <h2 className="font-black text-lg text-gray-900">Resumo</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({cart?.itemCount} itens)</span>
              <span>{formatCurrency(cart?.total ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frete</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-gray-900">
              <span>Total</span>
              <span className="text-brand-600 text-xl">{formatCurrency(cart?.total ?? 0)}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Finalizar Compra
            </Button>
            <Link to="/catalogo" className="block text-center text-sm text-brand-600 hover:underline">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
