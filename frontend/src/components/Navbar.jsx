import { NavLink, Link } from 'react-router-dom'
import { PawPrint, House, HeartHandshake, LayoutDashboard, LogIn } from 'lucide-react'

// os itens do menu ficam num array e o HTML é gerado com .map()
const links = [
  { to: '/', label: 'Feed', icone: House },
  { to: '/ongs', label: 'ONGs', icone: HeartHandshake },
  { to: '/acoes', label: 'Central', icone: LayoutDashboard },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
          <PawPrint className="w-6 h-6" />
          Pet Ajuda
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icone: Icone }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-green-50 text-green-700' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <Icone className="w-5 h-5" />
              {/* no celular só o ícone aparece; a partir de 640px aparece o texto */}
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}

          <button className="ml-2 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
