/**
 * @file ongService.js
 * @description Serviço de integração frontend para o módulo de ONGs e Campanhas do Pet Ajuda.
 * Comunica-se com os endpoints públicos, protegidos (USUARIO COMUM/ONG) e administrativos (ROLE_ADMIN) da API REST Java/Spring Boot.
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
 * Lista todas as ONGs aprovadas (público). Permite filtro opcional por cidade.
 * Endpoint: GET /api/v1/ongs
 * @param {Object} filtros Objeto contendo { cidade }
 */
export async function listarOngs(filtros = {}) {
  try {
    const res = await fetch(`${BASE_URL}/ongs`)
    if (!res.ok) throw new Error('Falha ao carregar lista de ONGs.')
    const ongs = await res.json()

    // Filtra no cliente por cidade se o filtro estiver preenchido
    return ongs
      .filter((o) => (o.status === 'APROVADA') && (!filtros.cidade || o.endereco?.cidade === filtros.cidade))
  } catch (err) {
    console.error('Erro em listarOngs:', err)
    return []
  }
}

/**
 * Obtém os detalhes de uma ONG específica por ID (público).
 * Endpoint: GET /api/v1/ongs/{id}
 * @param {string} id UUID da ONG
 */
export async function buscarOng(id) {
  if (!id) return null
  try {
    const res = await fetch(`${BASE_URL}/ongs/${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    return null
  }
}

/**
 * Lista os animais disponíveis para adoção vinculados a uma ONG (público).
 * Endpoint: GET /api/v1/animais/usuario/{usuarioId} (Mapeado através do usuário dono da ONG)
 * @param {string} ongId UUID da ONG
 */
export async function listarAnimaisDaOng(ongId) {
  // Nota: Na arquitetura Spring Boot, as fichas de animais são vinculadas ao ID do usuário dono da ONG ou buscadas no feed geral.
  // Buscamos do feed geral e filtramos os animais de adoção da respectiva instituição.
  try {
    const res = await fetch(`${BASE_URL}/publicacoes`)
    if (!res.ok) return []
    const publicacoes = await res.json()
    
    return publicacoes.filter(
      (p) => p.ongId === ongId && p.status === 'ATIVO' && p.tipo === 'ADOCAO'
    )
  } catch (err) {
    return []
  }
}

/**
 * Lista as campanhas ativas de ONGs aprovadas (público). Permite filtros por ongId ou cidade.
 * Endpoint: GET /api/v1/campanhas (Assumindo rota pública de listagem de campanhas)
 * @param {Object} filtros Objeto contendo { ongId, cidade }
 */
export async function listarCampanhas(filtros = {}) {
  try {
    const res = await fetch(`${BASE_URL}/campanhas`)
    if (!res.ok) return []
    const campanhas = await res.json()

    return campanhas.filter((c) => {
      const atendeAtivo = c.ativo !== false
      const atendeOngId = !filtros.ongId || c.ongId === filtros.ongId
      const atendeCidade = !filtros.cidade || c.cidade === filtros.cidade
      return atendeAtivo && atendeOngId && atendeCidade
    })
  } catch (err) {
    return []
  }
}

/**
 * Lista todas as campanhas de uma ONG específica no painel de gestão (ativa ou não).
 * Endpoint: GET /api/v1/campanhas/ong/{ongId}
 * @param {string} ongId UUID da ONG
 */
export async function listarCampanhasDaOng(ongId) {
  if (!ongId) return []
  try {
    const res = await fetch(`${BASE_URL}/campanhas/ong/${ongId}`, { headers: getHeaders() })
    if (!res.ok) return []
    return await res.json()
  } catch (err) {
    return []
  }
}

/**
 * Cria uma nova campanha solidária (Restrito a perfil ONG).
 * Endpoint: POST /api/v1/campanhas
 * @param {string} ongId UUID da ONG
 * @param {Object} campanha Dados da campanha { titulo, descricao, dataInicio, dataFim }
 */
export async function criarCampanha(ongId, campanha) {
  const res = await fetch(`${BASE_URL}/campanhas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...campanha, ongId })
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao criar campanha solidária.')
  return await res.json()
}

/**
 * Atualiza os dados de uma campanha existente (Restrito a perfil ONG).
 * Endpoint: PUT /api/v1/campanhas/{id}
 * @param {string} id UUID da campanha
 * @param {Object} campos Campos atualizados
 */
export async function atualizarCampanha(id, campos) {
  const res = await fetch(`${BASE_URL}/campanhas/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(campos)
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar a campanha.')
  return await res.json()
}

/**
 * Atualiza as informações institucionais da ONG logada.
 * Endpoint: PUT /api/v1/ongs/{id}
 * @param {string} id UUID da ONG
 * @param {Object} dados Dados cadastrais da instituição
 */
export async function atualizarOng(id, dados) {
  const res = await fetch(`${BASE_URL}/ongs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao atualizar dados da instituição.')
  return await res.json()
}

// ---- Administração (ROLE_ADMIN) ----

/**
 * Lista todas as ONGs cadastradas no sistema para moderação.
 * Endpoint: GET /api/v1/ongs (Com token ADMIN)
 */
export async function listarTodasOngs() {
  const res = await fetch(`${BASE_URL}/ongs`, { headers: getHeaders() })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao carregar listagem administrativa de ONGs.')
  return await res.json()
}

/**
 * Aprova ou reprova o cadastro institucional de uma ONG.
 * Endpoint: PATCH /api/v1/ongs/{id}/status?status=X
 * @param {string} id UUID da ONG
 * @param {string} status Novo status (APROVADA, REPROVADA)
 */
export async function alterarStatusOng(id, status) {
  const res = await fetch(`${BASE_URL}/ongs/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: getHeaders()
  })
  if (!res.ok) await tratarErroResponse(res, 'Falha ao alterar o status institucional da ONG.')
  return await res.json()
}