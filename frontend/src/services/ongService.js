/**
 * @file ongService.js
 * @description Serviço de integração frontend para o módulo de ONGs e Campanhas do Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function listarOngs(filtros = {}) {
  try {
    const [ongs, publicacoes] = await Promise.all([
      api.get('/ongs'),
      api.get('/publicacoes').catch(() => []),
    ])

    if (!Array.isArray(ongs)) return []
    const listaPubs = Array.isArray(publicacoes) ? publicacoes : []

    return ongs
      .filter((o) => {
        const aprovada = !o.status || o.status === 'APROVADA'
        const atendeEstado = !filtros.estado || o.endereco?.estado === filtros.estado
        const atendeCidade = !filtros.cidade || o.endereco?.cidade === filtros.cidade
        return aprovada && atendeEstado && atendeCidade
      })
      .map((o) => {
        const totalAnimais = listaPubs.filter(
          (p) =>
            p.usuarioId === o.usuarioId &&
            p.tipo === 'ADOCAO' &&
            (!p.status || p.status === 'ATIVO' || p.status === 'ATIVA' || p.status === 'DISPONIVEL')
        ).length
        return { ...o, totalAnimais }
      })
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

export async function buscarOngPorUsuario(id) {
  return await api(`/ongs/usuario/${id}`, {}, 'Erro ao buscar dados da instituição.')
}

export async function listarAnimaisDaOng(ongOuId) {
  try {
    const ong = typeof ongOuId === 'object' ? ongOuId : await buscarOng(ongOuId)
    if (!ong) return []

    const publicacoes = await api('/publicacoes')
    if (!Array.isArray(publicacoes)) return []

    return publicacoes.filter(
      (p) =>
        (p.usuarioId === ong.usuarioId || p.ongId === ong.id) &&
        p.tipo === 'ADOCAO' &&
        (!p.status || p.status === 'ATIVO' || p.status === 'ATIVA' || p.status === 'DISPONIVEL')
    )
  } catch {
    return []
  }
}

export async function listarCampanhas(filtros = {}) {
  try {
    const precisaFiltrarLocal = Boolean(filtros.estado || filtros.cidade)
    const [campanhas, ongs] = await Promise.all([
      api('/campanhas'),
      precisaFiltrarLocal ? api('/ongs').catch(() => []) : Promise.resolve([]),
    ])

    if (!Array.isArray(campanhas)) return []
    const mapaOngs = new Map((Array.isArray(ongs) ? ongs : []).map((o) => [o.id, o]))

    return campanhas.filter((c) => {
      const atendeAtivo = c.ativo !== false
      const atendeOngId = !filtros.ongId || c.ongId === filtros.ongId

      if (!precisaFiltrarLocal) return atendeAtivo && atendeOngId

      const ong = mapaOngs.get(c.ongId)
      const estadoCampanha = c.estado || c.endereco?.estado || ong?.endereco?.estado
      const cidadeCampanha = c.cidade || c.endereco?.cidade || ong?.endereco?.cidade

      const atendeEstado = !filtros.estado || estadoCampanha === filtros.estado
      const atendeCidade = !filtros.cidade || cidadeCampanha === filtros.cidade

      return atendeAtivo && atendeOngId && atendeEstado && atendeCidade
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
    body: {
      titulo: campanha.titulo,
      descricao: campanha.descricao,
      inicio: campanha.inicio,
      fim: campanha.fim,
    }
  }, 'Falha ao criar campanha solidária.')
}

export async function atualizarCampanha(id, campos) {
  return await api(`/campanhas/${id}`, {
    method: METHOD_TYPE.PUT,
    body: {
      titulo: campos.titulo,
      descricao: campos.descricao,
      inicio: campos.inicio,
      fim: campos.fim,
    }
  }, 'Falha ao atualizar a campanha.')
}

export async function alterarStatusCampanha(id, ativo) {
  return await api(`/campanhas/${id}/status?ativo=${ativo}`, {
    method: 'PATCH'
  }, 'Falha ao alterar o status da campanha.')
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