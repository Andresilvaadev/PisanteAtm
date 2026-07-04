import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const STORE_WHATSAPP = '5500000000000' // Substituir pelo número real

export function CheckoutPage() {
  const { cart, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const items = cart?.items ?? []

  if (items.length === 0 && !done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-2xl font-black text-gray-900">Carrinho vazio</h2>
        <Link to="/catalogo" className="text-brand-600 hover:underline">Ver produtos</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-3xl font-black text-gray-900">Pedido enviado!</h2>
        <p className="text-gray-500 text-lg">
          Sua mensagem foi enviada pelo WhatsApp. Nossa equipe vai confirmar seu pedido em breve.
        </p>
        <Button size="lg" onClick={() => navigate('/')}>Voltar à loja</Button>
      </div>
    )
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nome obrigatório'
    if (!form.phone.trim()) e.phone = 'Telefone obrigatório'
    if (!form.city.trim()) e.city = 'Cidade obrigatória'
    if (!form.address.trim()) e.address = 'Endereço obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const lines = [
      `*Novo Pedido — Pisante ATM*`,
      ``,
      `*Cliente:* ${form.name}`,
      `*Telefone:* ${form.phone}`,
      `*Endereço:* ${form.address}, ${form.city}`,
      ``,
      `*Itens:*`,
      ...items.map(
        (i) =>
          `• ${i.productName}${i.size ? ` (${i.size})` : ''}${i.color ? ` - ${i.color}` : ''} x${i.quantity} = ${formatCurrency(i.subtotal)}`,
      ),
      ``,
      `*Total: ${formatCurrency(cart?.total ?? 0)}*`,
    ]

    const msg = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${msg}`, '_blank')

    clearCart()
    setDone(true)
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
        {/* Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-lg text-gray-900">Seus dados</h2>
            <Input
              label="Nome completo"
              placeholder="João da Silva"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="WhatsApp / Telefone"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
            />
            <Input
              label="Cidade"
              placeholder="São Paulo"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              error={errors.city}
            />
            <Input
              label="Endereço (rua, número, bairro)"
              placeholder="Rua das Flores, 123 - Centro"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              error={errors.address}
            />
          </div>

          <p className="text-sm text-gray-400 text-center">
            Ao finalizar, você será redirecionado para o WhatsApp para confirmar o pedido com nossa equipe.
          </p>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
            <h2 className="font-black text-lg text-gray-900">Resumo</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                    {item.size && <p className="text-xs text-gray-400">Tam. {item.size}</p>}
                    <p className="text-sm text-gray-600">
                      {item.quantity}x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cart?.total ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frete</span>
                <span className="text-green-600 font-medium">Grátis</span>
              </div>
              <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(cart?.total ?? 0)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full gap-2" onClick={handleSubmit}>
              <MessageCircle className="w-5 h-5" />
              Pedir pelo WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
