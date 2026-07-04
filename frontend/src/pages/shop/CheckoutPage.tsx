import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/store/cartStore'
import { orderService } from '@/services/orderService'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  recipientName: z.string().min(3, 'Nome obrigatório'),
  zipCode: z.string().length(8, 'CEP deve ter 8 dígitos'),
  street: z.string().min(3, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
})

type FormData = z.infer<typeof schema>

export function CheckoutPage() {
  const { cart, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Carrinho vazio')
      return
    }

    setSubmitting(true)
    try {
      // In production: create address first, then order with addressId
      // For simplicity, using a mock addressId
      await orderService.create('00000000-0000-0000-0000-000000000000', undefined)
      await clearCart()
      toast.success('Pedido realizado com sucesso!')
      navigate('/conta/pedidos')
    } catch {
      toast.error('Erro ao finalizar pedido. Verifique o endereço.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    navigate('/carrinho')
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">Endereço de Entrega</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nome do destinatário" id="recipientName" placeholder="João Silva" error={errors.recipientName?.message} {...register('recipientName')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="CEP" id="zipCode" placeholder="00000000" maxLength={8} error={errors.zipCode?.message} {...register('zipCode')} />
                <Input label="Estado" id="state" placeholder="SP" maxLength={2} error={errors.state?.message} {...register('state')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input label="Rua" id="street" placeholder="Rua das Flores" error={errors.street?.message} {...register('street')} />
                </div>
                <Input label="Número" id="number" placeholder="123" error={errors.number?.message} {...register('number')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Bairro" id="neighborhood" placeholder="Centro" error={errors.neighborhood?.message} {...register('neighborhood')} />
                <Input label="Cidade" id="city" placeholder="São Paulo" error={errors.city?.message} {...register('city')} />
              </div>
              <Input label="Complemento (opcional)" id="complement" placeholder="Apto 12" error={errors.complement?.message} {...register('complement')} />

              <Button type="submit" size="lg" loading={submitting} className="w-full mt-4">
                Confirmar Pedido
              </Button>
            </form>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-4">
            <h2 className="font-black text-lg text-gray-900">Resumo do Pedido</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-600 truncate">{item.productName} {item.size && `(${item.size})`} × {item.quantity}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Frete</span><span>Grátis</span>
              </div>
              <div className="flex justify-between font-black text-gray-900 text-lg">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
