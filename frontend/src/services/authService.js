/**
 * @file authService.js
 * @description Serviço de integração frontend para autenticação e gestão de perfil de usuário.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const getHeaders = () => {
  const token = localStorage.getItem('petajuda_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

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
 * Realiza o login do usuário na API.
 */
export async function login(email, senha) {
  const res = await fetch(`${BASE_URL}/autenticacao/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
  if (!res.ok) await tratarErroResponse(res, 'E-mail ou senha incorretos.')
  return await res.json()
}

/**
 * Realiza o cadastro de um novo usuário.
 */
export async function cadastrarUsuario(dados) {
  const res = await fetch(`${BASE_URL}/autenticacao/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao realizar cadastro.')
  return await res.json()
}

/**
 * Realiza o cadastro de uma nova ONG / protetor.
 */
export async function cadastrarOng(dados) {
  const res = await fetch(`${BASE_URL}/autenticacao/cadastro-ong`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao cadastrar instituição.')
  return await res.json()
}

/**
 * Obtém os dados do perfil do usuário logado (GET /api/v1/usuarios/me).
 */
export async function obterPerfilLogado() {
  const res = await fetch(`${BASE_URL}/usuarios/me`, {
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar perfil do usuário.')
  return await res.json()
}

/**
 * Atualiza os dados do perfil do usuário logado (PUT /api/v1/usuarios/me).
 */
export async function atualizarPerfil(id, dados) {
  const res = await fetch(`${BASE_URL}/usuarios/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar perfil.')
  return await res.json()
}

/**
 * Altera a senha do usuário logado (PATCH /api/v1/usuarios/me/senha).
 */
export async function alterarSenha(senhaAntiga, senhaNova) {
  const res = await fetch(`${BASE_URL}/usuarios/me/senha`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ senhaAntiga, senhaNova })
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao alterar senha.')
  return true
}

/**
 * Envia solicitação de recuperação de senha.
 */
export async function recuperarSenha(email) {
  const res = await fetch(`${BASE_URL}/autenticacao/recuperar-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  if (!res.ok) {
    // Apenas silencia erro para segurança ou dispara se necessário
    return true
  }
  return true
}