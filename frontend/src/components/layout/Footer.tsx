import { Link } from 'react-router-dom'
import { Instagram, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black text-gray-400 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gold divider */}
        <div className="gold-divider mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img
                src="/pisantelogo.png"
                alt="Pisante ATM"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Sua loja de calçados e roupas com estilo. Qualidade e conforto para o seu dia a dia.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://www.instagram.com/pisanteatm/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2.5 rounded-lg bg-stone-900 hover:bg-brand-600 hover:text-black text-gray-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/559391099374" aria-label="WhatsApp" className="p-2.5 rounded-lg bg-stone-900 hover:bg-green-600 hover:text-white text-gray-400 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Loja</h4>
            <ul className="space-y-3">
              {[
                ['Catálogo', '/catalogo'],
                ['Promoções', '/catalogo?sortBy=price_asc'],
                ['Novidades', '/catalogo?sortBy=newest'],
                ['Mais Vendidos', '/catalogo?sortBy=sales'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-500 hover:text-brand-500 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Atendimento</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-gray-500">Seg–Sex: 9h às 18h</span></li>
              <li>
                <a href="https://wa.me/559391099374" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 footer__credit">
            © {new Date().getFullYear()} Pisante ATM. By <a href="https://instagram.com/valtryxsystems" target="_blank" rel="noopener noreferrer" className="text-white">Valtryx Systems</a>
          </p>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-xs text-gray-700 hover:text-brand-500 transition-colors">
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
