import { requisicao, formularioComFoto } from '../http'
import { paraPublicacao, paraAnimal, paraOng, paraEnderecoDto } from './mapeadores'

const cacheAnimais = new Map()

async function buscarAnimal(id) {
  if (!id) return null
  if (!cacheAnimais.has(id)) {
    cacheAnimais.set(id, requisicao(`/api/v1/animais/${id}`).then(paraAnimal).catch(() => null))
  }
  return cacheAnimais.get(id)
}

async function ongsPorUsuario() {
  const lista = await requisicao('/api/v1/ongs').catch(() => [])
  return new Map((lista || []).map((o) => [o.usuarioId, paraOng(o)]))
}

// a publicação da API traz só nome e foto do animal; busca a ficha para mostrar espécie, porte etc.
async function completar(lista) {
  const ongs = await ongsPorUsuario()
  return Promise.all(lista.map(async (r) => paraPublicacao(r, await buscarAnimal(r.animalId), ongs.get(r.usuarioId))))
}

const maisRecentesPrimeiro = (a, b) => new Date(b.data) - new Date(a.data)

// GET /api/v1/publicacoes  (a API ainda não filtra: o filtro é feito aqui)
export async function listarPublicacoes(filtros = {}) {
  const todas = await completar((await requisicao('/api/v1/publicacoes')) || [])
  return todas
    .filter((p) =>
      (!filtros.tipoPublicacao || p.tipoPublicacao === filtros.tipoPublicacao) &&
      (!filtros.especie || p.animal.especieAnimal === filtros.especie) &&
      (!filtros.porte || p.animal.porteAnimal === filtros.porte) &&
      (!filtros.cidade || p.endereco.cidade === filtros.cidade) &&
      (!filtros.status || p.status === filtros.status))
    .sort(maisRecentesPrimeiro)
}

export async function buscarPublicacao(id) {
  try {
    const [p] = await completar([await requisicao(`/api/v1/publicacoes/${id}`)])
    return p
  } catch (err) {
    if (err.status === 404 || err.status === 400) return null
    throw err
  }
}

export async function listarPublicacoesDoAutor(usuarioId) {
  return (await listarPublicacoes()).filter((p) => p.autor.usuarioId === usuarioId)
}

export const listarTodasPublicacoes = () => listarPublicacoes()

function animalRequest(animal, descricaoPublicacao) {
  return {
    nome: animal.nome,
    sexo: animal.sexo,
    corPredominante: animal.corPredominante,
    castrado: animal.castrado,
    vacinado: animal.vacinado,
    descricao: animal.descricao || descricaoPublicacao || 'Sem descrição',
    idade: animal.idadeAnimal,
    porte: animal.porteAnimal,
    especie: animal.especieAnimal,
  }
}

// POST /api/v1/animais (ficha + foto) e depois POST /api/v1/publicacoes
export async function criarPublicacao({ titulo, descricao, tipoPublicacao, animal, endereco }) {
  if (!animal.fotoUrl) throw new Error('Adicione uma foto do animal para publicar.')
  const ficha = await requisicao('/api/v1/animais', {
    metodo: 'POST', form: formularioComFoto(animalRequest(animal, descricao), animal.fotoUrl),
  })
  const pub = await requisicao('/api/v1/publicacoes', {
    metodo: 'POST',
    form: formularioComFoto({ titulo, descricao, tipo: tipoPublicacao, animalId: ficha.id, endereco: paraEnderecoDto(endereco) }),
  })
  cacheAnimais.delete(ficha.id)
  return buscarPublicacao(pub.id)
}

// PUT /api/v1/animais/{id} e PUT /api/v1/publicacoes/{id}
export async function atualizarPublicacao(id, { titulo, descricao, tipoPublicacao, animal, endereco }) {
  const atual = await requisicao(`/api/v1/publicacoes/${id}`)
  if (atual.animalId) {
    const fotoNova = animal.fotoUrl?.startsWith('data:') ? animal.fotoUrl : null
    await requisicao(`/api/v1/animais/${atual.animalId}`, {
      metodo: 'PUT', form: formularioComFoto(animalRequest(animal, descricao), fotoNova),
    })
    cacheAnimais.delete(atual.animalId)
  }
  await requisicao(`/api/v1/publicacoes/${id}`, {
    metodo: 'PUT',
    form: formularioComFoto({ titulo, descricao, tipo: tipoPublicacao, animalId: atual.animalId, endereco: paraEnderecoDto(endereco) }),
  })
  return buscarPublicacao(id)
}

export async function alterarStatusPublicacao(id, status) {
  await requisicao(`/api/v1/publicacoes/${id}/status`, { metodo: 'PATCH', params: { status } })
}

export async function excluirPublicacao(id) {
  await requisicao(`/api/v1/publicacoes/${id}`, { metodo: 'DELETE' })
}
