/**
 * @file publicacaoService.js
 * @description Serviço de integração frontend para o módulo de Publicações e Feed do Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function listarPublicacoes(filtros = {}) {
  try {
    const publicacoes = await api.get('/publicacoes')
    if (!Array.isArray(publicacoes)) return []

    return publicacoes.filter((p) => {
      const tipoPub = p.tipo || p.tipoPublicacao
      const especiePet = p.especie || p.animal?.especie || p.animal?.especieAnimal
      const portePet = p.porte || p.animal?.porte || p.animal?.porteAnimal
      const cidadePub = p.endereco?.cidade

      const atendeTipo = !filtros.tipoPublicacao || tipoPub === filtros.tipoPublicacao
      const atendeEspecie = !filtros.especie || especiePet === filtros.especie
      const atendePorte = !filtros.porte || portePet === filtros.porte
      const atendeCidade = !filtros.cidade || cidadePub === filtros.cidade
      const atendeStatus = !filtros.status || p.status === filtros.status
      return atendeTipo && atendeEspecie && atendePorte && atendeCidade && atendeStatus
    })
  } catch (err) {
    console.error('Erro em listarPublicacoes:', err)
    return []
  }
}

export async function buscarPublicacao(id) {
  if (!id) return null
  try {
    return await api(`/publicacoes/${id}`)
  } catch {
    return null
  }
}

export async function listarPublicacoesDoAutor(usuarioId) {
  if (!usuarioId) return []
  try {
    const publicacoes = await api('/publicacoes')
    if (!Array.isArray(publicacoes)) return []
    return publicacoes.filter((p) => p.usuarioId === usuarioId || p.autor?.usuarioId === usuarioId)
  } catch (err) {
    console.error('Erro em listarPublicacoesDoAutor:', err)
    return []
  }
}

export async function listarTodasPublicacoes() {
  try {
    return await api('/publicacoes', {}, 'Falha ao carregar listagem geral.')
  } catch {
    return []
  }
}

export async function criarPublicacao(formData) {
  return await api('/publicacoes', {
    method: METHOD_TYPE.POST,
    body: formData
  }, 'Falha ao criar a publicação no sistema.')
}

export async function atualizarPublicacao(id, formData) {
  return await api(`/publicacoes/${id}`, {
    method: METHOD_TYPE.PUT,
    body: formData
  }, 'Falha ao atualizar a publicação.')
}

export async function alterarStatusPublicacao(id, status) {
  return await api(`/publicacoes/${id}/status?status=${status}`, {
    method: METHOD_TYPE.PATCH
  }, 'Falha ao alterar o status da publicação.')
}

export async function excluirPublicacao(id) {
  await api(`/publicacoes/${id}`, {
    method: METHOD_TYPE.DELETE
  }, 'Falha ao excluir a publicação.')
  return true
}