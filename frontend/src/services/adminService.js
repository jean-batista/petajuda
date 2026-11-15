/**
 * @file adminService.js
 * @description Serviço de integração frontend para o painel administrativo do Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function obterMetricas() {
  try {
    const [usersData, denunciasData] = await Promise.all([
      api('/usuarios', {}, 'Falha ao carregar usuários.'),
      api('/denuncias', {}, 'Falha ao carregar denúncias.')
    ])

    const listaUsers = usersData.content || usersData
    const listaDenuncias = denunciasData.content || denunciasData

    return {
      totalUsuarios: listaUsers.length,
      usuariosAtivos: listaUsers.filter(u => u.ativo).length,
      totalOngs: 0,
      ongsPendentes: 0,
      publicacoesAtivas: 0,
      animaisResolvidos: 0,
      totalDenuncias: listaDenuncias.length,
      denunciasPendentes: listaDenuncias.filter(d => d.status === 'PENDENTE').length,
    }
  } catch (err) {
    console.error('Erro em obterMetricas:', err)
    return {
      totalUsuarios: 0,
      totalOngs: 0,
      ongsPendentes: 0,
      publicacoesAtivas: 0,
      animaisResolvidos: 0,
      totalDenuncias: 0,
      denunciasPendentes: 0,
    }
  }
}

export async function listarDenunciasAdmin() {
  const data = await api('/denuncias', {}, 'Falha ao carregar triagem de denúncias.')
  return data.content || data
}

export async function atualizarStatusDenuncia(id, status) {
  return await api(`/denuncias/${id}/status?status=${status}`, {
    method: METHOD_TYPE.PATCH
  }, 'Falha ao atualizar o status da denúncia.')
}

export async function listarUsuariosAdmin() {
  const data = await api('/usuarios', {}, 'Falha ao carregar lista de usuários.')
  return data.content || data
}

export async function alternarStatusUsuarioAdmin(id, ativo) {
  const endpoint = ativo ? 'reativar' : 'desativar'
  return await api(`/usuarios/${id}/${endpoint}`, {
    method: METHOD_TYPE.PATCH
  }, `Falha ao ${endpoint} o usuário.`)
}

export async function listarOngsAdmin() {
  const data = await api('/ongs', {}, 'Falha ao carregar lista de ONGs.')
  return data.content || data
}

export async function atualizarStatusOngAdmin(id, status) {
  return await api(`/ongs/${id}/status?status=${status}`, {
    method: METHOD_TYPE.PATCH
  }, 'Falha ao atualizar o status da ONG.')
}