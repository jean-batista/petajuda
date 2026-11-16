import { requisicao } from '../http'
import { paraOng, paraCampanha, paraEnderecoDto } from './mapeadores'
import { listarPublicacoes } from './publicacaoApi'

async function comTotais(ongs) {
  const pubs = await listarPublicacoes({ status: 'ATIVO', tipoPublicacao: 'ADOCAO' }).catch(() => [])
  return ongs.map((o) => ({ ...o, totalAnimais: pubs.filter((p) => p.autor.ongId === o.id).length }))
}

export async function listarOngs(filtros = {}) {
  const ongs = ((await requisicao('/api/v1/ongs')) || []).map(paraOng)
  return comTotais(ongs.filter((o) => !filtros.cidade || o.endereco.cidade === filtros.cidade))
}

export const listarTodasOngs = () => listarOngs()

export async function buscarOng(id) {
  try {
    const [ong] = await comTotais([paraOng(await requisicao(`/api/v1/ongs/${id}`))])
    return ong
  } catch {
    return null
  }
}

export async function buscarOngDoUsuario(usuarioId) {
  const lista = (await requisicao('/api/v1/ongs').catch(() => [])) || []
  const ong = lista.find((o) => o.usuarioId === usuarioId)
  return ong ? paraOng(ong) : null
}

export async function listarAnimaisDaOng(ongId) {
  const pubs = await listarPublicacoes({ status: 'ATIVO', tipoPublicacao: 'ADOCAO' })
  return pubs.filter((p) => p.autor.ongId === ongId)
}

export async function listarCampanhas(filtros = {}) {
  const lista = filtros.ongId
    ? await requisicao(`/api/v1/campanhas/ong/${filtros.ongId}`)
    : await requisicao('/api/v1/campanhas')
  let campanhas = (lista || []).map(paraCampanha).filter((c) => c.ativo)
  if (filtros.cidade) {
    const ongs = ((await requisicao('/api/v1/ongs')) || []).map(paraOng)
    const daCidade = new Set(ongs.filter((o) => o.endereco.cidade === filtros.cidade).map((o) => o.id))
    campanhas = campanhas.filter((c) => daCidade.has(c.ongId))
  }
  return campanhas
}

export async function listarCampanhasDaOng(ongId) {
  return ((await requisicao(`/api/v1/campanhas/ong/${ongId}`)) || []).map(paraCampanha)
}

// datas da tela (AAAA-MM-DD) -> LocalDateTime da API
const campanhaRequest = (c) => ({
  titulo: c.titulo,
  descricao: c.descricao,
  inicio: `${c.dataInicio}T00:00:00`,
  fim: `${c.dataFim}T23:59:00`,
})

export async function criarCampanha(_ongId, campanha) {
  const nova = paraCampanha(await requisicao('/api/v1/campanhas', { metodo: 'POST', json: campanhaRequest(campanha) }))
  if (campanha.ativo === false) await alterarAtivo(nova.id, false)
  return nova
}

async function alterarAtivo(id, ativo) {
  return requisicao(`/api/v1/campanhas/${id}/status`, { metodo: 'PATCH', params: { ativo } })
}

export async function atualizarCampanha(id, campos) {
  // só ativar/desativar
  if (Object.keys(campos).length === 1 && 'ativo' in campos) return paraCampanha(await alterarAtivo(id, campos.ativo))
  let atualizada = await requisicao(`/api/v1/campanhas/${id}`, { metodo: 'PUT', json: campanhaRequest(campos) })
  if ('ativo' in campos && campos.ativo !== atualizada.ativo) atualizada = await alterarAtivo(id, campos.ativo)
  return paraCampanha(atualizada)
}

export async function atualizarOng(id, { nome, razaoSocial, chavePix, descricao, endereco }) {
  const atual = await requisicao(`/api/v1/ongs/${id}`)
  return paraOng(await requisicao(`/api/v1/ongs/${id}`, {
    metodo: 'PUT',
    json: { nome, razaoSocial, cnpj: atual.cnpj, chavePix, descricao, endereco: paraEnderecoDto({ ...atual.endereco, ...endereco }) },
  }))
}

// o backend ainda não tem aprovação de ONGs
export async function alterarStatusOng() {
  throw new Error('A aprovação de ONGs ainda não existe no backend.')
}
