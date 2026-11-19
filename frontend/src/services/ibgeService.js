/**
 * @file ibgeService.js
 * @description Consulta estados (UF) e municípios brasileiros na API pública do IBGE com cache local.
 */

const BASE_IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades'
const CACHE_PREFIX = 'petajuda_ibge_'

function lerCache(chave) {
  try {
    const salvo = sessionStorage.getItem(CACHE_PREFIX + chave)
    return salvo ? JSON.parse(salvo) : null
  } catch {
    return null
  }
}

function salvarCache(chave, dados) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + chave, JSON.stringify(dados))
  } catch {
    // Ignora caso o storage esteja bloqueado ou cheio
  }
}

/**
 * Retorna a lista de estados brasileiros ordenados por nome: [{ sigla: 'SC', nome: 'Santa Catarina' }, ...]
 */
export async function listarEstados() {
  const cache = lerCache('estados')
  if (cache) return cache

  const resposta = await fetch(`${BASE_IBGE}/estados?orderBy=nome`)
  if (!resposta.ok) throw new Error('Falha ao carregar estados do IBGE.')

  const dados = await resposta.json()
  const estados = dados.map((uf) => ({
    id: uf.id,
    sigla: uf.sigla,
    nome: uf.nome,
  }))

  salvarCache('estados', estados)
  return estados
}

/**
 * Retorna a lista de nomes de municípios de uma UF (ex: 'SC') ordenados alfabeticamente.
 */
export async function listarCidadesPorEstado(uf) {
  if (!uf) return []
  const sigla = uf.toUpperCase().trim()

  const cache = lerCache(`cidades_${sigla}`)
  if (cache) return cache

  const resposta = await fetch(`${BASE_IBGE}/estados/${sigla}/municipios?orderBy=nome`)
  if (!resposta.ok) throw new Error(`Falha ao carregar cidades de ${sigla}.`)

  const dados = await resposta.json()
  const cidades = dados.map((municipio) => municipio.nome)

  salvarCache(`cidades_${sigla}`, cidades)
  return cidades
}