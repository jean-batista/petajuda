import { publicacoes } from '../data/mockData'

// simula a demora da internet (400 milissegundos)
const esperar = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// lista as publicações aplicando os filtros escolhidos
export async function listarPublicacoes(filtros = {}) {
    await esperar()
    return publicacoes.filter((p) =>
        (!filtros.tipoPublicacao || p.tipoPublicacao === filtros.tipoPublicacao) &&
        (!filtros.especie || p.animal.especieAnimal === filtros.especie) &&
        (!filtros.porte || p.animal.porteAnimal === filtros.porte) &&
        (!filtros.cidade || p.endereco.cidade === filtros.cidade) &&
        (!filtros.status || p.status === filtros.status)
    )
}

// busca uma publicação pelo id
export async function buscarPublicacao(id) {
    await esperar()
    return publicacoes.find((p) => p.id === id) ?? null
}