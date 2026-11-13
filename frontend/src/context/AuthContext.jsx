import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const CHAVE_SESSAO = 'petajuda:sessao'

// Guarda quem está logado e qual janela de acesso está aberta
// ('login' | 'cadastro' | 'ong' | 'recuperar' | null). O site abre normalmente para visitantes:
// o login só é pedido quando a pessoa tenta fazer algo que exige conta.
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [pronto, setPronto] = useState(false) // terminou de checar a sessão salva?
  const [modal, setModal] = useState(null)
  const [destino, setDestino] = useState(null) // para onde ir depois de entrar

  // ao abrir o site, recupera a sessão salva (se houver)
  useEffect(() => {
    let ativo = true
    async function restaurar() {
      let id = null
      try { id = localStorage.getItem(CHAVE_SESSAO) } catch { /* ignora */ }
      const encontrado = id ? await authService.buscarUsuario(id) : null
      if (ativo) {
        setUsuario(encontrado)
        setPronto(true)
      }
    }
    restaurar()
    return () => { ativo = false }
  }, [])

  const guardarSessao = (u) => {
    setUsuario(u)
    try {
      if (u) localStorage.setItem(CHAVE_SESSAO, u.id)
      else localStorage.removeItem(CHAVE_SESSAO)
    } catch { /* ignora */ }
  }

  const concluirAcesso = (u, rotaPadrao) => {
    guardarSessao(u)
    setModal(null)
    if (destino) {
      navigate(destino.rota, { state: destino.estado })
      setDestino(null)
    } else if (rotaPadrao) {
      navigate(rotaPadrao)
    }
  }

  const abrirModal = useCallback((nome) => setModal(nome), [])
  const fecharModal = useCallback(() => { setModal(null); setDestino(null) }, [])

  // usado por botões que exigem conta: se não logou, abre o login e continua depois
  const exigirLogin = (rota, estado) => {
    if (usuario) return true
    setDestino({ rota, estado })
    setModal('login')
    return false
  }

  const valor = {
    usuario, pronto, modal, abrirModal, fecharModal, exigirLogin,
    entrar: async (email, senha) => concluirAcesso(await authService.login(email, senha)),
    cadastrar: async (dados) => concluirAcesso(await authService.registrar(dados)),
    // a ONG vai direto para a Central, onde vê o aviso de "em análise"
    cadastrarOng: async (dados) => concluirAcesso(await authService.registrarOng(dados), '/acoes'),
    sair: () => { guardarSessao(null); navigate('/') },
    // recarrega os dados do usuário depois de editar o perfil
    atualizarUsuario: (u) => setUsuario(u),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
