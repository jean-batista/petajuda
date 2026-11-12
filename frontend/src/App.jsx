import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Detalhes from './pages/Detalhes'
import Ongs from './pages/Ongs'
import Acoes from './pages/Acoes'
import Login from './pages/login'
import RegisterUser from './pages/RegisterUser'      // Importa a Tela 07 (Cadastro)
import NovaPublicacao from './pages/NovaPublicacao'  // Importa a Tela 12 (Nova Publicação)

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/publicacoes/:id" element={<Detalhes />} />
        <Route path="/ongs" element={<Ongs />} />
        <Route path="/acoes" element={<Acoes />} />
        <Route path="/login" element={<Login />} />

        {/* Novas rotas integradas */}
        <Route path="/cadastrar" element={<RegisterUser />} />               {/* Tela 07 */}
        <Route path="/painel/publicacoes/nova" element={<NovaPublicacao />} /> {/* Tela 12 */}
      </Route>
    </Routes>
  )
}