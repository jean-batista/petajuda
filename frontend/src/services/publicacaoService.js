/**
 * @file publicacaoService.js
 * @description Serviço de integração frontend para o módulo de Publicações e Feed do Pet Ajuda.
 * Comunica-se com os endpoints públicos, protegidos e administrativos da API REST Java/Spring Boot.
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
 * Lista todas as publicações ativas do feed público, com suporte opcional a filtros avançados.
 * Endpoint: GET /api/v1/publicacoes
 * @param {Object} filtros Objeto contendo { tipoPublicacao, especie, porte, cidade, status }
 */
export async function listarPublicacoes(filtros = {}) {
  try {
    const res = await fetch(`${BASE_URL}/publicacoes`)
    if (!res.ok) throw new Error('Falha ao carregar feed de publicações.')
    const publicacoes = await res.json()

    // Aplica os filtros localmente ou via query params se suportado pela API
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

/**
 * Obtém os detalhes de uma publicação específica por ID (público).
 * Endpoint: GET /api/v1/publicacoes/{id}
 * @param {string} id UUID da publicação
 */
export async function buscarPublicacao(id) {
  if (!id) return null
  try {
    const res = await fetch(`${BASE_URL}/publicacoes/${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    return null
  }
}

/**
 * Lista todas as publicações vinculadas a um autor/usuário específico.
 * Endpoint: GET /api/v1/publicacoes/usuario/{usuarioId} (ou filtrado do feed geral)
 * @param {string} usuarioId UUID do usuário autor
 */
export async function listarPublicacoesDoAutor(usuarioId) {
  if (!usuarioId) return []
  try {
    const res = await fetch(`${BASE_URL}/publicacoes`)
    if (!res.ok) return []
    const publicacoes = await res.json()

    // Filtra no cliente pelas publicações pertencentes ao usuário logado
    return publicacoes.filter((p) => p.usuarioId === usuarioId || p.autor?.usuarioId === usuarioId)
  } catch (err) {
    console.error('Erro em listarPublicacoesDoAutor:', err)
    return []
  }
}

/**
 * Lista todas as publicações do sistema sem restrições (Painel Administrativo).
 * Endpoint: GET /api/v1/publicacoes (Com token ADMIN)
 */
export async function listarTodasPublicacoes() {
  try {
    const res = await fetch(`${BASE_URL}/publicacoes`, {
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Falha ao carregar listagem geral.')
    return await res.json()
  } catch (err) {
    return []
  }
}

/**
 * Cria uma nova publicação enviando o payload JSON e a foto via multipart/form-data.
 * Endpoint: POST /api/v1/publicacoes
 * @param {FormData} formData Objeto FormData contendo 'dados' (JSON Blob) e 'foto' (MultipartFile)
 */
export async function criarPublicacao(formData) {
  const token = localStorage.getItem('petajuda_token')
  const res = await fetch(`${BASE_URL}/publicacoes`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
      // Nota: Não definimos Content-Type para multipart/form-data; o browser gera o boundary automaticamente.
    },
    body: formData
  })

  if (!res.ok) await tratarErroResponse(res, 'Falha ao criar a publicação no sistema.')
  return await res.json()
}

/**
 * Atualiza uma publicação existente (Suporta envio de novos dados e opcionalmente nova foto via Multipart).
 * Endpoint: PUT /api/v1/publicacoes/{id}
 * @param {string} id UUID da publicação
 * @param {FormData} formData Objeto FormData contendo os dados atualizados e nova foto
 */
export async function atualizarPublicacao(id, formData) {
  const token = localStorage.getItem('petajuda_token')
  const res = await fetch(`${BASE_URL}/publicacoes/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  })

  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar a publicação.')
  return await res.json()
}

/**
 * Altera o status operacional de uma publicação (ex: ATIVO para RESOLVIDO).
 * Endpoint: PATCH /api/v1/publicacoes/{id}/status?status=X
 * @param {string} id UUID da publicação
 * @param {string} status Novo status (ATIVO, RESOLVIDO)
 */
export async function alterarStatusPublicacao(id, status) {
  const res = await fetch(`${BASE_URL}/publicacoes/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao alterar o status da publicação.')
  return await res.json()
}

/**
 * Exclui permanentemente uma publicação e suas mídias associadas na nuvem.
 * Endpoint: DELETE /api/v1/publicacoes/{id}
 * @param {string} id UUID da publicação
 */
export async function excluirPublicacao(id) {
  const res = await fetch(`${BASE_URL}/publicacoes/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao excluir a publicação.')
  return true
}