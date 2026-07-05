import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/utils/cn'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cart } = useCartStore()

  const itemCount = cart?.itemCount ?? 0

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/pisantelogo.png"
              alt="Pisante ATM"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-brand-500 transition-colors tracking-wider uppercase text-xs">
              Início
            </Link>
            <Link to="/catalogo" className="text-sm font-medium text-gray-400 hover:text-brand-500 transition-colors tracking-wider uppercase text-xs">
              Catálogo
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/catalogo" className="p-2 text-gray-400 hover:text-brand-500 transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            <Link to="/carrinho" className="relative p-2 text-gray-400 hover:text-brand-500 transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </Link>


            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-brand-500 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className={cn('md:hidden overflow-hidden transition-all', menuOpen ? 'max-h-32 pb-4' : 'max-h-0')}>
          <nav className="flex flex-col gap-1 pt-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm font-medium text-gray-400 hover:text-brand-500 tracking-wider uppercase">Início</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm font-medium text-gray-400 hover:text-brand-500 tracking-wider uppercase">Catálogo</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
