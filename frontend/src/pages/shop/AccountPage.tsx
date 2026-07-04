import { Outlet, NavLink } from 'react-router-dom'
import { User, ShoppingBag, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export function AccountPage() {
  const { user } = useAuthStore()

  const links = [
    { to: '/conta', label: 'Meu Perfil', icon: User, exact: true },
    { to: '/conta/pedidos', label: 'Meus Pedidos', icon: ShoppingBag },
    { to: '/conta/senha', label: 'Alterar Senha', icon: Lock },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center">
          <span className="text-2xl font-black text-brand-600">{user?.firstName[0]}</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{user?.firstName} {user?.lastName}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sm:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
