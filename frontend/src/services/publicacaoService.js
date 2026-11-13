import dados, { salvar, gerarId, esperar } from '../data/store'

// publicações de ONGs ainda não aprovadas não aparecem no feed público
function visivel(publicacao) {
  const ongId = publicacao.autor?.ongId
  if (!ongId) return true
  const ong = dados.ongs.find((o) => o.id === ongId)
  return !ong || ong.status === 'APROVADA'
}

const maisRecentesPrimeiro = (a, b) => new Date(b.data) - new Date(a.data)

// futuro: GET /api/publicacoes  (mesmos nomes de query params da documentação)
export async function listarPublicacoes(filtros = {}) {
  await esperar(200)
  return dados.publicacoes
    .filter((p) =>
      visivel(p) &&
      (!filtros.tipoPublicacao || p.tipoPublicacao === filtros.tipoPublicacao) &&
      (!filtros.especie || p.animal.especieAnimal === filtros.especie) &&
      (!filtros.porte || p.animal.porteAnimal === filtros.porte) &&
      (!filtros.cidade || p.endereco.cidade === filtros.cidade) &&
      (!filtros.status || p.status === filtros.status)
    )
    .sort(maisRecentesPrimeiro)
}

// futuro: GET /api/publicacoes/{id}
export async function buscarPublicacao(id) {
  await esperar(150)
  return dados.publicacoes.find((p) => p.id === id) ?? null
}

export async function listarPublicacoesDoAutor(usuarioId) {
  await esperar(150)
  return dados.publicacoes.filter((p) => p.autor.usuarioId === usuarioId).sort(maisRecentesPrimeiro)
}

// todas, sem filtro de visibilidade (painel do admin)
export async function listarTodasPublicacoes() {
  await esperar(150)
  return [...dados.publicacoes].sort(maisRecentesPrimeiro)
}

function montarAutor(usuario, exibirTelefone) {
  const ong = usuario.ongId ? dados.ongs.find((o) => o.id === usuario.ongId) : null
  return {
    usuarioId: usuario.id,
    nome: ong ? ong.nome : `${usuario.nome} ${usuario.sobrenome}`.trim(),
    telefone: usuario.telefone,
    exibirTelefone,
    ...(ong ? { ongId: ong.id } : {}),
  }
}

// futuro: POST /api/animais + POST /api/publicacoes (ficha do pet e depois o post)
export async function criarPublicacao({ titulo, descricao, tipoPublicacao, animal, endereco, exibirTelefone }, usuario) {
  await esperar()
  const publicacao = {
    id: gerarId('p'), titulo, descricao, tipoPublicacao, status: 'ATIVO',
    data: new Date().toISOString(),
    animal: { id: gerarId('a'), ...animal },
    endereco: { estado: 'SC', ...endereco },
    autor: montarAutor(usuario, exibirTelefone),
  }
  dados.publicacoes.unshift(publicacao)
  salvar()
  return publicacao
}

// futuro: PUT /api/animais/{id}
export async function atualizarPublicacao(id, { titulo, descricao, tipoPublicacao, animal, endereco, exibirTelefone }) {
  await esperar()
  const publicacao = dados.publicacoes.find((p) => p.id === id)
  Object.assign(publicacao, { titulo, descricao, tipoPublicacao })
  publicacao.animal = { ...publicacao.animal, ...animal }
  publicacao.endereco = { ...publicacao.endereco, ...endereco }
  publicacao.autor = { ...publicacao.autor, exibirTelefone }
  salvar()
  return publicacao
}

// futuro: PATCH /api/publicacoes/{id}/status
export async function alterarStatusPublicacao(id, status) {
  await esperar(150)
  const publicacao = dados.publicacoes.find((p) => p.id === id)
  publicacao.status = status
  salvar()
  return publicacao
}

// futuro: DELETE /api/publicacoes/{id}
export async function excluirPublicacao(id) {
  await esperar(150)
  dados.publicacoes = dados.publicacoes.filter((p) => p.id !== id)
  salvar()
}
