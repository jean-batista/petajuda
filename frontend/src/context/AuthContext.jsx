/**
 * @file AuthContext.jsx
 * @description Contexto global de autenticação do Pet Ajuda.
 * Segue o fluxo: Tela/Componente -> AuthContext -> AuthService -> API.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService'
import { buscarOngPorUsuario } from '../services/ongService'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const CHAVE_TOKEN = 'petajuda_token'
const CHAVE_USUARIO = 'petajuda:usuario'

function normalizarUsuario(dados) {
  if (!dados) return null
  const u = dados.usuario || dados
  const ongId = u.ongId || u.ong?.id || null
  const perfilBase = u.perfil || u.tipoPerfil || (ongId ? 'ONG' : 'USUARIO_COMUM')
  const perfil = perfilBase !== 'ADMIN' && ongId ? 'ONG' : perfilBase
  const nome = u.nome || u.nomeCompleto?.split(' ')[0] || 'Usuário'

  return {
    ...u,
    ongId,
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

  const enriquecerComOng = useCallback(async (u) => {
    if (!u?.id || u.perfil === 'ADMIN') return u
    try {
      const ong = await buscarOngPorUsuario(u.id)
      if (ong?.id) {
        return normalizarUsuario({ ...u, ongId: ong.id, ong, perfil: 'ONG' })
      }
    } catch {
      // Usuário não possui ONG vinculada
    }
    return u
  }, [])

  const guardarSessao = useCallback(async (resposta) => {
    if (!resposta) {
      limparSessaoLocal()
      return null
    }

    const token = resposta.token || resposta.accessToken
    try {
      if (token) localStorage.setItem(CHAVE_TOKEN, token)
    } catch { /* ignora erro de storage */ }

    let usuarioNormalizado = normalizarUsuario(resposta)
    if (usuarioNormalizado && !usuarioNormalizado.ongId) {
      usuarioNormalizado = await enriquecerComOng(usuarioNormalizado)
    }

    setUsuario(usuarioNormalizado)
    try {
      if (usuarioNormalizado) {
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuarioNormalizado))
      }
    } catch { /* ignora erro de storage */ }

    return usuarioNormalizado
  }, [enriquecerComOng, limparSessaoLocal])

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

      if (cacheUsuario && ativo) {
        setUsuario(normalizarUsuario(cacheUsuario))
      }

      try {
        const perfilAtualizado = await authService.obterPerfilLogado()
        if (ativo) {
          if (perfilAtualizado) {
            await guardarSessao(perfilAtualizado)
          } else {
            limparSessaoLocal()
          }
        }
      } catch {
        if (ativo) limparSessaoLocal()
      } finally {
        if (ativo) setPronto(true)
      }
    }

    restaurar()
    return () => { ativo = false }
  }, [guardarSessao, limparSessaoLocal])

  const concluirAcesso = async (resposta, rotaPadrao) => {
    await guardarSessao(resposta)
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
    entrar: async (email, senha) => concluirAcesso(await authService.login(email, senha)),
    cadastrar: async (dados) => concluirAcesso(await authService.cadastrarUsuario(dados)),
    cadastrarOng: async (dados) => {
      const ongCriada = await authService.cadastrarOng(dados)
      if (ongCriada?.id) {
        atualizarUsuario({ ongId: ongCriada.id, ong: ongCriada, perfil: 'ONG' })
      }
      setModal(null)
      navigate('/acoes')
      return ongCriada
    },
    sair,
    atualizarUsuario,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}