import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { orderService, buildWhatsAppMessage, generateOrderNumber } from '@/services/orderService'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/Button'

export function CheckoutPage() {
  const { cart, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)

  const items = cart?.items ?? []
  const total = cart?.total ?? 0

  if (items.length === 0 && !done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-2xl font-black text-gray-900">Carrinho vazio</h2>
        <Link to="/catalogo" className="text-brand-600 hover:underline text-sm">Ver produtos</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-3xl font-black text-gray-900">Pedido enviado!</h2>
        <p className="text-gray-500 text-lg">
          Você foi redirecionado para o WhatsApp. Nossa equipe confirmará seu pedido em breve.
        </p>
        <Button size="lg" onClick={() => navigate('/')}>Voltar à loja</Button>
      </div>
    )
  }

  const handleConfirm = () => {
    setSending(true)

    // Gera o número do pedido aqui para que a mensagem WhatsApp e o
    // registro no banco compartilhem o mesmo identificador
    const orderNumber = generateOrderNumber()
    const whatsappUrl = buildWhatsAppMessage(items, total, orderNumber)

    // window.open deve ser chamado de forma síncrona dentro do event handler
    // para não ser bloqueado por popup blockers do navegador
    window.open(whatsappUrl, '_blank')

    clearCart()
    setDone(true)

    // Salva o pedido no Supabase de forma assíncrona (fire & forget)
    // Não bloqueia o redirecionamento — falha não impede o cliente de finalizar
    orderService
      .create(items, total, total, whatsappUrl, orderNumber)
      .catch((err) => console.error('[orderService.create]', err))
      .finally(() => setSending(false))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate('/carrinho')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao carrinho
      </button>

      <h1 className="text-3xl font-black text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* Lista de itens */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-lg text-gray-900">Seus itens</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {item.quantity}× {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 flex-shrink-0 self-center">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-400 text-center px-4">
            Ao confirmar, você será redirecionado para o WhatsApp para finalizar o pedido com nossa equipe.
          </p>
        </div>

        {/* Resumo + botão */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
            <h2 className="font-black text-lg text-gray-900">Resumo</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart?.itemCount} {cart?.itemCount === 1 ? 'item' : 'itens'})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frete</span>
                <span className="text-green-600 font-medium">Grátis</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-gray-900 text-lg">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(total)}</span>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              loading={sending}
              onClick={handleConfirm}
            >
              <MessageCircle className="w-5 h-5" />
              Confirmar pelo WhatsApp
            </Button>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Sem cadastro necessário. Você será atendido diretamente no WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
