import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import AuthModals from '../components/auth/AuthModals'

// moldura de todas as páginas: Navbar em cima, rodapé embaixo
// e o <Outlet /> no meio, onde entra a página da rota atual.
// As janelas de login/cadastro ficam aqui, então funcionam em qualquer tela.
export default function MainLayout() {
  const { pathname } = useLocation()

  // ao trocar de tela, volta ao topo
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-800">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        Pet Ajuda · Proteção animal na AMUREL 🐾
      </footer>
      <AuthModals />
    </div>
  )
}
