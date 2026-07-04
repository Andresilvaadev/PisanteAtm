import { Link } from 'react-router-dom'
import { Instagram, Facebook, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-white tracking-tight">PISANTE</span>
              <span className="text-sm font-semibold text-brand-400">ATM</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Sua loja de calçados e roupas com estilo. Qualidade e conforto para o seu dia a dia.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Instagram" className="p-2 rounded-xl bg-gray-800 hover:bg-brand-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-xl bg-gray-800 hover:bg-brand-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me/5500000000000" aria-label="WhatsApp" className="p-2 rounded-xl bg-gray-800 hover:bg-green-600 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Loja</h4>
            <ul className="space-y-2.5">
              {[
                ['Catálogo', '/catalogo'],
                ['Promoções', '/catalogo?sortBy=price_asc'],
                ['Novidades', '/catalogo?sortBy=newest'],
                ['Mais Vendidos', '/catalogo?sortBy=sales'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Atendimento</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-gray-400">Seg–Sex: 9h às 18h</span></li>
              <li><a href="https://wa.me/5500000000000" className="text-sm text-gray-400 hover:text-white transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Pisante ATM. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-500">CNPJ: 00.000.000/0001-00</p>
            <Link to="/login" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
