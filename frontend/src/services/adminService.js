/**
 * @file adminService.js
 * @description Serviço de integração frontend para o painel administrativo do Pet Ajuda.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function obterMetricas() {
  try {
    const [usersData, denunciasData, ongsData, pubsData] = await Promise.all([
      api('/usuarios', {}, 'Falha ao carregar usuários.'),
      api('/denuncias', {}, 'Falha ao carregar denúncias.'),
      api('/ongs').catch(() => []),
      api('/publicacoes').catch(() => []),
    ])

    const listaUsers = usersData.content || usersData || []
    const listaDenuncias = denunciasData.content || denunciasData || []
    const listaOngs = ongsData.content || ongsData || []
    const listaPubs = pubsData.content || pubsData || []

    return {
      totalUsuarios: listaUsers.length,
      usuariosAtivos: listaUsers.filter((u) => u.ativo !== false).length,
      totalOngs: listaOngs.length,
      ongsPendentes: 0,
      publicacoesAtivas: listaPubs.filter((p) => p.status === 'ATIVO').length,
      animaisResolvidos: listaPubs.filter((p) => p.status === 'RESOLVIDO').length,
      totalDenuncias: listaDenuncias.length,
      denunciasPendentes: listaDenuncias.filter((d) => d.status === 'PENDENTE').length,
    }
  } catch (err) {
    console.error('Erro em obterMetricas:', err)
    return {
      totalUsuarios: 0,
      usuariosAtivos: 0,
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