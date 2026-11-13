import dados, { salvar, gerarId, esperar } from '../data/store'

const aprovada = (ong) => ong.status === 'APROVADA'

function comTotais(ong) {
  const totalAnimais = dados.publicacoes.filter(
    (p) => p.autor.ongId === ong.id && p.status === 'ATIVO' && p.tipoPublicacao === 'ADOCAO'
  ).length
  return { ...ong, totalAnimais }
}

// futuro: GET /api/ongs  (somente ONGs aprovadas)
export async function listarOngs(filtros = {}) {
  await esperar(200)
  return dados.ongs
    .filter((o) => aprovada(o) && (!filtros.cidade || o.endereco.cidade === filtros.cidade))
    .map(comTotais)
}

// futuro: GET /api/ongs/{id}
export async function buscarOng(id) {
  await esperar(100)
  const ong = dados.ongs.find((o) => o.id === id)
  return ong ? comTotais(ong) : null
}

// futuro: GET /api/ongs/{id}/animais
export async function listarAnimaisDaOng(ongId) {
  await esperar(150)
  return dados.publicacoes.filter(
    (p) => p.autor.ongId === ongId && p.status === 'ATIVO' && p.tipoPublicacao === 'ADOCAO'
  )
}

// futuro: GET /api/campanhas  (só campanhas ativas de ONGs aprovadas)
export async function listarCampanhas(filtros = {}) {
  await esperar(150)
  return dados.campanhas
    .filter((c) => {
      const ong = dados.ongs.find((o) => o.id === c.ongId)
      return (
        c.ativo && ong && aprovada(ong) &&
        (!filtros.ongId || c.ongId === filtros.ongId) &&
        (!filtros.cidade || ong.endereco.cidade === filtros.cidade)
      )
    })
    .map((c) => ({ ...c, ongNome: dados.ongs.find((o) => o.id === c.ongId).nome }))
}

// painel da ONG: todas as campanhas dela, ativas ou não
export async function listarCampanhasDaOng(ongId) {
  await esperar(100)
  return dados.campanhas.filter((c) => c.ongId === ongId)
}

// futuro: POST /api/campanhas
export async function criarCampanha(ongId, campanha) {
  await esperar()
  const nova = { id: gerarId('c'), ongId, ...campanha }
  dados.campanhas.unshift(nova)
  salvar()
  return nova
}

// futuro: PUT /api/campanhas/{id}
export async function atualizarCampanha(id, campos) {
  await esperar()
  const campanha = dados.campanhas.find((c) => c.id === id)
  Object.assign(campanha, campos)
  salvar()
  return campanha
}

// futuro: PUT /api/ongs/me
export async function atualizarOng(id, { nome, razaoSocial, chavePix, descricao, endereco, contato }) {
  await esperar()
  const ong = dados.ongs.find((o) => o.id === id)
  Object.assign(ong, { nome, razaoSocial, chavePix, descricao })
  ong.endereco = { ...ong.endereco, ...endereco }
  ong.contato = { ...ong.contato, ...contato }
  salvar()
  return ong
}

// ---- administração (ADMIN) ----

export async function listarTodasOngs() {
  await esperar(150)
  return dados.ongs.map(comTotais)
}

// futuro: aprovar/reprovar cadastro institucional
export async function alterarStatusOng(id, status) {
  await esperar(150)
  const ong = dados.ongs.find((o) => o.id === id)
  ong.status = status
  salvar()
  return ong
}
