import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Detalhes from './pages/Detalhes'
import Ongs from './pages/Ongs'
import Acoes from './pages/Acoes'
import Login from './pages/login'

// tabela de rotas: cada URL mostra uma página dentro do MainLayout
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/publicacoes/:id" element={<Detalhes />} />
        <Route path="/ongs" element={<Ongs />} />
        <Route path="/acoes" element={<Acoes />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  )
}
