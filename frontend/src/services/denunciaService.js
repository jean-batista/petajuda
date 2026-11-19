/**
 * @file denunciaService.js
 * @description Serviço de integração frontend para o módulo de Denúncias do Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function criarDenuncia(dados, fotoArquivo = null) {
  const formData = new FormData()
  
  formData.append('dados', new Blob([JSON.stringify({
    titulo: dados.titulo || 'Denúncia de maus-tratos / abandono',
    descricao: dados.descricao,
    endereco: dados.endereco
  })], { type: 'application/json' }))

  if (fotoArquivo) {
    formData.append('foto', fotoArquivo)
  } else {
    formData.append('foto', new Blob([], { type: 'image/jpeg' }), 'vazio.jpg')
  }

  return await api('/denuncias', {
    method: METHOD_TYPE.POST,
    body: formData
  }, 'Falha ao registrar a denúncia anônima.')
}

export async function consultarDenuncia(protocolo) {
  if (!protocolo || !protocolo.trim()) return null
  try {
    const data = await api(`/denuncias/${protocolo.trim()}`)
    if (!data) return null
    return {
      status: data.status,
      data: data.data || data.dataRegistro
    }
  } catch {
    return null
  }
}

export async function listarDenuncias() {
  const data = await api('/denuncias', {}, 'Falha ao carregar a triagem de denúncias.')
  return data.content || data
}

export async function alterarStatusDenuncia(id, status) {
  return await api(`/denuncias/${id}/status?status=${status}`, {
    method: METHOD_TYPE.PATCH
  }, 'Falha ao atualizar o status da denúncia.')
}