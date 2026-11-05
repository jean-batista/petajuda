import { ongs, campanhas } from '../data/mockData'

// simula a demora da internet (400 milissegundos)
const esperar = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// futuro: GET /api/ongs?cidade=...
export async function listarOngs(filtros = {}) {
  await esperar()
  return ongs.filter((o) => !filtros.cidade || o.endereco.cidade === filtros.cidade)
}

// futuro: GET /api/campanhas (só as ativas)
export async function listarCampanhas() {
  await esperar()
  return campanhas.filter((c) => c.ativo)
}
