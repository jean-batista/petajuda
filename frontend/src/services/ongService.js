/**
 * @file ongService.js
 * @description Serviço de integração frontend para o módulo de ONGs e Campanhas do Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function listarOngs(filtros = {}) {
  try {
    const ongs = await api.get('/ongs')
    if (!Array.isArray(ongs)) return []
    return ongs.filter((o) => (o.status === 'APROVADA') && (!filtros.cidade || o.endereco?.cidade === filtros.cidade))
  } catch (err) {
    console.error('Erro em listarOngs:', err)
    return []
  }
}

export async function buscarOng(id) {
  if (!id) return null
  try {
    return await api(`/ongs/${id}`)
  } catch {
    return null
  }
}

/**
 * Busca a ONG pública vinculada ao ID de um usuário.
 * @param {number|string} id ID do usuário
 */
export async function buscarOngPorUsuario(id) {
  return await api(`/ongs/usuario/${id}`, {}, 'Erro ao buscar dados da instituição.')
}

export async function listarAnimaisDaOng(ongId) {
  try {
    const publicacoes = await api('/publicacoes')
    if (!Array.isArray(publicacoes)) return []
    return publicacoes.filter(
      (p) => p.ongId === ongId && p.status === 'ATIVO' && p.tipo === 'ADOCAO'
    )
  } catch {
    return []
  }
}

export async function listarCampanhas(filtros = {}) {
  try {
    const campanhas = await api('/campanhas')
    if (!Array.isArray(campanhas)) return []
    return campanhas.filter((c) => {
      const atendeAtivo = c.ativo !== false
      const atendeOngId = !filtros.ongId || c.ongId === filtros.ongId
      const atendeCidade = !filtros.cidade || c.cidade === filtros.cidade
      return atendeAtivo && atendeOngId && atendeCidade
    })
  } catch {
    return []
  }
}

export async function listarCampanhasDaOng(ongId) {
  if (!ongId) return []
  try {
    const data = await api(`/campanhas/ong/${ongId}`)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function criarCampanha(ongId, campanha) {
  return await api('/campanhas', {
    method: METHOD_TYPE.POST,
    body: { ...campanha, ongId }
  }, 'Falha ao criar campanha solidária.')
}

export async function atualizarCampanha(id, campos) {
  return await api(`/campanhas/${id}`, {
    method: METHOD_TYPE.PUT,
    body: campos
  }, 'Falha ao atualizar a campanha.')
}

export async function atualizarOng(id, dados) {
  return await api(`/ongs/${id}`, {
    method: METHOD_TYPE.PUT,
    body: dados
  }, 'Falha ao atualizar dados da instituição.')
}

export async function listarTodasOngs() {
  return await api('/ongs', {}, 'Falha ao carregar listagem administrativa de ONGs.')
}

export async function alterarStatusOng(id, status) {
  return await api(`/ongs/${id}/status?status=${status}`, {
    method: 'PATCH'
  }, 'Falha ao alterar o status institucional da ONG.')
}