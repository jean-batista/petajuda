import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Detalhes from './pages/Detalhes'
import Ongs from './pages/Ongs'
import Acoes from './pages/Acoes'
import { useAuth } from './context/AuthContext'

// Links antigos (/login, /cadastrar) agora abrem a janela de acesso por cima do feed.
// Assim continuam existindo só 4 telas, como o grupo definiu.
function AbrirJanela({ nome }) {
  const { abrirModal } = useAuth()
  useEffect(() => { abrirModal(nome) }, [nome, abrirModal])
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/publicacoes/:id" element={<Detalhes />} />
        <Route path="/ongs" element={<Ongs />} />
        <Route path="/acoes" element={<Acoes />} />

        <Route path="/login" element={<AbrirJanela nome="login" />} />
        <Route path="/cadastrar" element={<AbrirJanela nome="cadastro" />} />
        <Route path="/cadastrar-ong" element={<AbrirJanela nome="ong" />} />
        <Route path="/recuperar-senha" element={<AbrirJanela nome="recuperar" />} />
        <Route path="/painel/*" element={<Navigate to="/acoes" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
