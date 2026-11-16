import { USAR_API } from './http'
import * as api from './api/denunciaApi'
import dados, { salvar, gerarId, esperar } from '../data/store'

// futuro: POST /api/denuncias  (público e anônimo: não guarda quem enviou)
export async function criarDenuncia({ descricao, fotoUrl, endereco }) {
  if (USAR_API) return api.criarDenuncia(...arguments)
  await esperar()
  const denuncia = {
    id: gerarId('d'), descricao, fotoUrl: fotoUrl || '',
    data: new Date().toISOString(), status: 'PENDENTE',
    endereco: { estado: 'SC', ...endereco },
  }
  dados.denuncias.unshift(denuncia)
  salvar()
  return denuncia
}

// acompanhamento pelo denunciante (RF14): com o protocolo ele vê só a situação
export async function consultarDenuncia(protocolo) {
  if (USAR_API) return api.consultarDenuncia(...arguments)
  await esperar(150)
  const denuncia = dados.denuncias.find((d) => d.id === protocolo.trim())
  return denuncia ? { status: denuncia.status, data: denuncia.data } : null
}

// futuro: GET /api/denuncias (ADMIN)
export async function listarDenuncias() {
  if (USAR_API) return api.listarDenuncias(...arguments)
  await esperar(150)
  return [...dados.denuncias].sort((a, b) => new Date(b.data) - new Date(a.data))
}

// futuro: PATCH /api/denuncias/{id}/status (ADMIN)
export async function alterarStatusDenuncia(id, status) {
  if (USAR_API) return api.alterarStatusDenuncia(...arguments)
  await esperar(150)
  const denuncia = dados.denuncias.find((d) => d.id === id)
  denuncia.status = status
  salvar()
  return denuncia
}
