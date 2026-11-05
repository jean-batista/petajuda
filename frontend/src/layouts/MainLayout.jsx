import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

// moldura de todas as páginas: Navbar em cima, rodapé embaixo
// e o <Outlet /> no meio, onde entra a página da rota atual
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        Pet Ajuda · Proteção animal na AMUREL 🐾
      </footer>
    </div>
  )
}
