import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z
  .object({
    firstName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await authService.register(data)
      setAuth(auth)
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao criar conta'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-brand-600">PISANTE ATM</Link>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Criar sua conta</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome" id="firstName" placeholder="João" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Sobrenome" id="lastName" placeholder="Silva" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="E-mail" type="email" id="email" placeholder="seu@email.com" error={errors.email?.message} {...register('email')} />
            <Input label="Senha" type="password" id="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Input label="Confirmar Senha" type="password" id="confirmPassword" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full mt-2">
              Criar Conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
