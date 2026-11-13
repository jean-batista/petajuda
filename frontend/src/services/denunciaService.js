/**
 * @file denunciaService.js
 * @description Serviço de integração frontend para o módulo de Denúncias do Pet Ajuda.
 * Comunica-se com os endpoints públicos e protegidos (ROLE_ADMIN) da API REST Java/Spring Boot.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

/**
 * Obtém os headers HTTP padrão contendo o token JWT de autenticação do usuário logado (ADMIN).
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
 * Cria uma denúncia anônima (POST /api/v1/denuncias) enviando dados em JSON e foto de evidência via MultipartForm.
 * @param {Object} dados Objeto contendo { titulo, descricao, endereco }
 * @param {File|Blob|null} fotoArquivo Arquivo de imagem da evidência
 */
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
    // Envia um blob vazio caso não tenha foto, mas lembre-se que o backend exige foto para denúncias
    formData.append('foto', new Blob([], { type: 'image/jpeg' }), 'vazio.jpg')
  }

  const res = await fetch(`${BASE_URL}/denuncias`, {
    method: 'POST',
    // Não enviamos o Content-Type manualmente para multipart/form-data (o browser define o boundary)
    body: formData
  })

  if (!res.ok) await tratarErroResponse(res, 'Falha ao registrar a denúncia anônima.')
  return await res.json()
}

/**
 * Acompanha o status de uma denúncia pelo protocolo (UUID) de forma pública.
 * Endpoint: GET /api/v1/denuncias/{id}
 * @param {string} protocolo UUID da denúncia
 */
export async function consultarDenuncia(protocolo) {
  if (!protocolo || !protocolo.trim()) return null
  try {
    const res = await fetch(`${BASE_URL}/denuncias/${protocolo.trim()}`)
    if (!res.ok) return null
    const data = await res.json()
    // Retorna apenas as informações públicas permitidas para acompanhamento
    return {
      status: data.status,
      data: data.data || data.dataRegistro
    }
  } catch (err) {
    return null
  }
}

/**
 * Lista todas as denúncias cadastradas (Restrito a ROLE_ADMIN).
 * Endpoint: GET /api/v1/denuncias
 */
export async function listarDenuncias() {
  const res = await fetch(`${BASE_URL}/denuncias`, { headers: getHeaders() })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar a triagem de denúncias.')
  return await res.json()
}

/**
 * Altera o status de triagem de uma denúncia (Restrito a ROLE_ADMIN).
 * Endpoint: PATCH /api/v1/denuncias/{id}/status?status=X
 * @param {string} id UUID da denúncia
 * @param {string} status Novo status (PENDENTE, EM_ANALISE, CONCLUIDA, DESCARTADA)
 */
export async function alterarStatusDenuncia(id, status) {
  const res = await fetch(`${BASE_URL}/denuncias/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar o status da denúncia.')
  return await res.json()
}