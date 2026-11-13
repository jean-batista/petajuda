import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { House, HeartHandshake, LayoutDashboard, LogIn, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PERFIL } from '../data/enums'

// Os itens do menu ficam num array e o HTML é gerado com .map()
const links = [
  { to: '/', label: 'Feed', icone: House },
  { to: '/ongs', label: 'ONGs', icone: HeartHandshake },
  { to: '/acoes', label: 'Central', icone: LayoutDashboard },
]

function MenuUsuario() {
  const { usuario, sair } = useAuth()
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)

  // Fecha o menu ao clicar fora dele
  useEffect(() => {
    const fora = (e) => caixa.current && !caixa.current.contains(e.target) && setAberto(false)
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  // Extração segura do nome (considerando tanto nomeCompleto quanto nome separado)
  const nomeExibicao = usuario?.nomeCompleto || usuario?.nome || 'Usuário'
  const inicial = nomeExibicao.charAt(0).toUpperCase()
  
  // Tratamento do perfil mapeado do enum do Backend (ex: USUARIO_COMUM, ADMIN, ONG)
  const perfilChave = usuario?.tipoPerfil || usuario?.perfil || 'USUARIO_COMUM'
  const rotuloPerfil = PERFIL[perfilChave] || perfilChave

  return (
    <div className="relative ml-2" ref={caixa}>
      <button
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium hover:bg-stone-50 transition-colors"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white shadow-sm">
          {inicial}
        </span>
        <span className="hidden max-w-28 truncate sm:inline text-stone-800">{nomeExibicao}</span>
        <ChevronDown className="h-4 w-4 text-stone-400" />
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl animate-fade-in z-50">
          <div className="border-b border-stone-100 px-3 py-2.5">
            <p className="truncate font-semibold text-stone-900">{nomeExibicao}</p>
            <p className="truncate text-xs text-stone-500">{usuario?.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
              {rotuloPerfil}
            </span>
          </div>
          <Link to="/acoes" onClick={() => setAberto(false)} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors">
            <LayoutDashboard className="h-4 w-4 text-stone-500" /> Central de Ações
          </Link>
          <button
            onClick={() => { setAberto(false); sair() }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { usuario, pronto, abrirModal } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Pet Ajuda, página inicial">
          <img src="/logo-header.png" alt="Pet Ajuda" className="h-10 w-auto sm:h-12" />
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icone: Icone }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <Icone className="h-5 w-5" />
              {/* no celular só o ícone aparece; a partir de 640px aparece o texto */}
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}

          {!pronto ? null : usuario ? (
            <MenuUsuario />
          ) : (
            <button
              onClick={() => abrirModal('login')}
              className="ml-2 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}