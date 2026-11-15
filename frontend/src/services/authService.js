/**
 * @file authService.js
 * @description Serviço de integração frontend para autenticação e gestão de perfil de usuário.
 */
import { api } from '../api/api'
import { METHOD_TYPE } from '../data/enums'

export async function login(email, senha) {
  return await api('/autenticacao/login', {
    method: METHOD_TYPE.POST,
    body: { email, senha }
  }, 'E-mail ou senha incorretos.')
}

export async function cadastrarUsuario(dados) {
  return await api('/autenticacao/cadastro', {
    method: METHOD_TYPE.POST,
    body: dados
  }, 'Falha ao realizar cadastro.')
}

export async function cadastrarOng(dados) {
  return await api('/autenticacao/cadastro-ong', {
    method: METHOD_TYPE.POST,
    body: dados
  }, 'Falha ao cadastrar instituição.')
}

export async function obterPerfilLogado() {
  return await api('/usuarios/me', {}, 'Falha ao carregar perfil do usuário.')
}

export async function atualizarPerfil(id, dados) {
  return await api('/usuarios/me', {
    method: METHOD_TYPE.PUT,
    body: dados
  }, 'Falha ao atualizar perfil.')
}

export async function alterarSenha(senhaAntiga, senhaNova) {
  await api.patch('/usuarios/me/senha', {
    method: METHOD_TYPE.PATCH,
    body: { senhaAntiga, senhaNova }
  }, 'Falha ao alterar senha.')
  return true
}

export async function recuperarSenha(email) {
  try {
    await api.post('/autenticacao/recuperar-senha', {
      method: METHOD_TYPE.POST,
      body: { email }
    })
  } catch {
    // Silencia para segurança
  }
  return true
}