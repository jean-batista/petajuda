/**
 * @file adminService.js
 * @description Serviço de integração frontend para o painel administrativo do Pet Ajuda.
 * Comunica-se com os endpoints protegidos por ROLE_ADMIN na API REST Java/Spring Boot.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

/**
 * Obtém os headers HTTP padrão contendo o token JWT de autenticação do usuário logado.
 */
const getHeaders = () => {
  const token = localStorage.getItem('petajuda_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

/**
 * Utilitário auxiliar para tratar respostas de erro da API.
 */
async function tratarErroResponse(res, mensagemPadrao) {
  try {
    const errorData = await res.json()
    throw new Error(errorData.detail || errorData.message || mensagemPadrao)
  } catch (err) {
    if (err.message && err.message !== mensagemPadrao) throw err
    throw new Error(mensagemPadrao)
  }
}

/**
 * Obtém métricas consolidadas do sistema a partir dos endpoints de usuários e denúncias (RF19).
 */
export async function obterMetricas() {
  try {
    const [resUsers, resDenuncias] = await Promise.all([
      fetch(`${BASE_URL}/usuarios`, { headers: getHeaders() }),
      fetch(`${BASE_URL}/denuncias`, { headers: getHeaders() })
    ])

    if (!resUsers.ok || !resDenuncias.ok) {
      throw new Error('Falha ao carregar métricas consolidadas.')
    }

    const usersData = await resUsers.json()
    const denunciasData = await resDenuncias.json()

    const listaUsers = usersData.content || usersData

    return {
      totalUsuarios: listaUsers.length,
      usuariosAtivos: listaUsers.filter(u => u.ativo).length,
      totalOngs: 0, // Integração com lista de ONGs se aplicável
      ongsPendentes: 0,
      publicacoesAtivas: 0,
      animaisResolvidos: 0,
      totalDenuncias: denunciasData.length,
      denunciasPendentes: denunciasData.filter(d => d.status === 'PENDENTE').length,
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

/**
 * Lista todas as denúncias cadastradas no sistema para triagem administrativa.
 */
export async function listarDenunciasAdmin() {
  const res = await fetch(`${BASE_URL}/denuncias`, { headers: getHeaders() })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar triagem de denúncias.')
  return await res.json()
}

/**
 * Atualiza o status de triagem de uma denúncia.
 * @param {string} id UUID da denúncia
 * @param {string} status Novo status (PENDENTE, EM_ANALISE, CONCLUIDA, DESCARTADA)
 */
export async function atualizarStatusDenuncia(id, status) {
  const res = await fetch(`${BASE_URL}/denuncias/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar o status da denúncia.')
  return await res.json()
}

/**
 * Lista todos os usuários cadastrados na plataforma (com suporte a paginação do Spring).
 */
export async function listarUsuariosAdmin() {
  const res = await fetch(`${BASE_URL}/usuarios`, { headers: getHeaders() })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar lista de usuários.')
  const data = await res.json()
  return data.content || data
}

/**
 * Altera a situação de um usuário (suspende/desativa ou reativa).
 * @param {string} id UUID do usuário
 * @param {boolean} ativo True para reativar, false para desativar/suspender
 */
export async function alternarStatusUsuarioAdmin(id, ativo) {
  const endpoint = ativo ? 'reativar' : 'desativar'
  const res = await fetch(`${BASE_URL}/usuarios/${id}/${endpoint}`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, `Falha ao ${endpoint} o usuário.`)
}

/**
 * Lista todas as ONGs cadastradas no sistema para moderação.
 */
export async function listarOngsAdmin() {
  const res = await fetch(`${BASE_URL}/ongs`, { headers: getHeaders() })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar lista de ONGs.')
  return await res.json()
}

/**
 * Aprova ou reprova o cadastro de uma ONG.
 * @param {string} id UUID da ONG
 * @param {string} status APROVADA ou REPROVADA
 */
export async function atualizarStatusOngAdmin(id, status) {
  const res = await fetch(`${BASE_URL}/ongs/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar o status da ONG.')
  return await res.json()
}