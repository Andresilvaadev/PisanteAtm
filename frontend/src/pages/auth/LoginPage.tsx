import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await authService.login(data.email, data.password)
      setAuth(auth)
      toast.success(`Bem-vindo, ${auth.user.firstName}!`)
      const dest = from ?? ((auth.user.roles.includes('Admin') || auth.user.roles.includes('Employee')) ? '/admin' : '/')
      navigate(dest, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Credenciais inválidas'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-brand-600 tracking-tight">PISANTE ATM</Link>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Entrar na sua conta</h2>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo de volta!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              id="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              id="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Acesso restrito a administradores.{' '}
            <Link to="/" className="text-brand-600 hover:underline">Voltar à loja</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
