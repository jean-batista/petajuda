/**
 * @file animalService.js
 * @description Serviço de integração frontend para gerenciamento de animais no Pet Ajuda.
 * Alinhado com os endpoints do Swagger (/api/v1/animais).
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
 * Lista os animais do utilizador autenticado (GET /api/v1/animais/meus-animais)
 */
export async function listarMeusAnimais() {
  const res = await fetch(`${BASE_URL}/animais/meus-animais`, {
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar os seus animais.')
  return await res.json()
}

/**
 * Lista os animais de um utilizador específico (GET /api/v1/animais/usuario/{usuarioId})
 */
export async function listarAnimaisPorUsuario(usuarioId) {
  const res = await fetch(`${BASE_URL}/animais/usuario/${usuarioId}`, {
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao listar animais do utilizador.')
  return await res.json()
}

/**
 * Busca os detalhes de um animal específico pelo ID (GET /api/v1/animais/{id})
 */
export async function buscarAnimal(id) {
  const res = await fetch(`${BASE_URL}/animais/${id}`, {
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao buscar detalhes do animal.')
  return await res.json()
}

/**
 * Cadastra um novo animal via multipart/form-data (POST /api/v1/animais)
 */
export async function criarAnimal(formData) {
  const token = localStorage.getItem('petajuda_token')
  const res = await fetch(`${BASE_URL}/animais`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao cadastrar o animal.')
  return await res.json()
}

/**
 * Atualiza os dados cadastrais da ficha de um animal (PUT /api/v1/animais/{id})
 */
export async function atualizarAnimal(id, dados) {
  const res = await fetch(`${BASE_URL}/animais/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar dados do animal.')
  return await res.json()
}

/**
 * Exclui a ficha de um animal (DELETE /api/v1/animais/{id})
 */
export async function excluirAnimal(id) {
  const res = await fetch(`${BASE_URL}/animais/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao excluir o animal.')
}