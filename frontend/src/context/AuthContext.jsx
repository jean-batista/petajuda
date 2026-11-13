/**
 * @file AuthContext.jsx
 * @description Contexto global de autenticação do Pet Ajuda.
 * Segue o fluxo: Tela/Componente -> AuthContext -> AuthService -> API.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const CHAVE_TOKEN = 'petajuda_token'
const CHAVE_USUARIO = 'petajuda:usuario'

/**
 * Normaliza o objeto de usuário retornado pelo backend Spring Boot
 * garantindo compatibilidade com as propriedades esperadas pelos componentes React.
 */
function normalizarUsuario(dados) {
  if (!dados) return null
  const u = dados.usuario || dados
  const perfil = u.perfil || u.tipoPerfil || (u.ongId ? 'ONG' : 'USUARIO_COMUM')
  const nome = u.nome || u.nomeCompleto?.split(' ')[0] || 'Usuário'

  return {
    ...u,
    nome,
    perfil,
    tipoPerfil: perfil,
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [pronto, setPronto] = useState(false)
  const [modal, setModal] = useState(null)
  const [destino, setDestino] = useState(null)

  const limparSessaoLocal = useCallback(() => {
    setUsuario(null)
    try {
      localStorage.removeItem(CHAVE_TOKEN)
      localStorage.removeItem(CHAVE_USUARIO)
    } catch { /* ignora erro de storage */ }
  }, [])

  const guardarSessao = useCallback((resposta) => {
    if (!resposta) {
      limparSessaoLocal()
      return null
    }

    const token = resposta.token || resposta.accessToken
    const usuarioNormalizado = normalizarUsuario(resposta)

    setUsuario(usuarioNormalizado)
    try {
      if (token) localStorage.setItem(CHAVE_TOKEN, token)
      if (usuarioNormalizado) {
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuarioNormalizado))
      }
    } catch { /* ignora erro de storage */ }

    return usuarioNormalizado
  }, [limparSessaoLocal])

  // Restaura a sessão validando o token JWT salvo com a API via authService
  useEffect(() => {
    let ativo = true

    async function restaurar() {
      let token = null
      let cacheUsuario = null

      try {
        token = localStorage.getItem(CHAVE_TOKEN)
        const raw = localStorage.getItem(CHAVE_USUARIO)
        if (raw) cacheUsuario = JSON.parse(raw)
      } catch { /* ignora */ }

      if (!token) {
        if (ativo) {
          setUsuario(null)
          setPronto(true)
        }
        return
      }

      // Hidrata imediatamente com o cache para evitar flash de tela em branco
      if (cacheUsuario && ativo) {
        setUsuario(normalizarUsuario(cacheUsuario))
      }

      try {
        // Chama o authService para validar o token no endpoint /usuarios/me
        const perfilAtualizado = await authService.obterPerfilLogado()
        if (ativo) {
          if (perfilAtualizado) {
            guardarSessao(perfilAtualizado)
          } else {
            limparSessaoLocal()
          }
        }
      } catch {
        // Token expirado ou inválido no backend
        if (ativo) limparSessaoLocal()
      } finally {
        if (ativo) setPronto(true)
      }
    }

    restaurar()
    return () => { ativo = false }
  }, [guardarSessao, limparSessaoLocal])

  const concluirAcesso = (resposta, rotaPadrao) => {
    guardarSessao(resposta)
    setModal(null)
    if (destino) {
      navigate(destino.rota, { state: destino.estado })
      setDestino(null)
    } else if (rotaPadrao) {
      navigate(rotaPadrao)
    }
  }

  const abrirModal = useCallback((nome) => setModal(nome), [])
  const fecharModal = useCallback(() => {
    setModal(null)
    setDestino(null)
  }, [])

  const exigirLogin = useCallback((rota, estado) => {
    if (usuario) return true
    setDestino({ rota, estado })
    setModal('login')
    return false
  }, [usuario])

  const sair = useCallback(() => {
    limparSessaoLocal()
    navigate('/')
  }, [limparSessaoLocal, navigate])

  const atualizarUsuario = useCallback((novosDados) => {
    setUsuario((anterior) => {
      const combinado = normalizarUsuario({ ...anterior, ...novosDados })
      try {
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(combinado))
      } catch { /* ignora */ }
      return combinado
    })
  }, [])

  const valor = {
    usuario,
    pronto,
    modal,
    abrirModal,
    fecharModal,
    exigirLogin,
    // Integração direta com o authService seguindo o padrão estabelecido:
    entrar: async (email, senha) => concluirAcesso(await authService.login(email, senha)),
    cadastrar: async (dados) => concluirAcesso(await authService.cadastrarUsuario(dados)),
    cadastrarOng: async (dados) => concluirAcesso(await authService.cadastrarOng(dados), '/acoes'),
    sair,
    atualizarUsuario,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}