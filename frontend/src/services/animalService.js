/**
 * @file animalService.js
 * @description Serviço de integração frontend para gerenciamento de animais no Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function listarMeusAnimais() {
  return await api('/animais/meus-animais', {}, 'Falha ao carregar os seus animais.')
}

export async function listarAnimaisPorUsuario(usuarioId) {
  return await api(`/animais/usuario/${usuarioId}`, {}, 'Falha ao listar animais do utilizador.')
}

export async function buscarAnimal(id) {
  return await api(`/animais/${id}`, {}, 'Falha ao buscar detalhes do animal.')
}

export async function criarAnimal(formData) {
  return await api('/animais', {
    method: METHOD_TYPE.POST,
    body: formData
  }, 'Falha ao cadastrar o animal.')
}

export async function atualizarAnimal(id, dados) {
  return await api(`/animais/${id}`, {
    method: METHOD_TYPE.PUT,
    body: dados
  }, 'Falha ao atualizar dados do animal.')
}

export async function excluirAnimal(id) {
  return await api(`/animais/${id}`, {
    method: METHOD_TYPE.DELETE
  }, 'Falha ao excluir o animal.')
}

export async function listarAnimais(filtros = {}) {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })
  const query = params.toString() ? `?${params.toString()}` : ''
  return await api(`/animais${query}`, {}, 'Falha ao listar animais.')
}