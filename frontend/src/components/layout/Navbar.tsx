import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/utils/cn'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { isAuthenticated, user, logout, isEmployee } = useAuthStore()
  const { cart } = useCartStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setUserOpen(false)
    navigate('/')
  }

  const itemCount = cart?.itemCount ?? 0

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-brand-600 tracking-tight">PISANTE</span>
            <span className="text-sm font-semibold text-gray-400 self-end mb-0.5">ATM</span>
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Início
            </Link>
            <Link to="/catalogo" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Catálogo
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/catalogo" className="p-2 text-gray-500 hover:text-brand-600 transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            <Link to="/carrinho" className="relative p-2 text-gray-500 hover:text-brand-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Só mostra menu de usuário se estiver logado (apenas admin/employee) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-semibold text-sm">
                      {user?.firstName[0]?.toUpperCase()}
                    </span>
                  </div>
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    {isEmployee() && (
                      <Link
                        to="/admin"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Painel Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-brand-600"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className={cn('md:hidden overflow-hidden transition-all', menuOpen ? 'max-h-32 pb-4' : 'max-h-0')}>
          <nav className="flex flex-col gap-1 pt-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-600">Início</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-600">Catálogo</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
