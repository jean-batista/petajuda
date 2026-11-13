import dados, { salvar, gerarId, esperar } from '../data/store'

// futuro: POST /api/denuncias  (público e anônimo: não guarda quem enviou)
export async function criarDenuncia({ descricao, fotoUrl, endereco }) {
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
  await esperar(150)
  const denuncia = dados.denuncias.find((d) => d.id === protocolo.trim())
  return denuncia ? { status: denuncia.status, data: denuncia.data } : null
}

// futuro: GET /api/denuncias (ADMIN)
export async function listarDenuncias() {
  await esperar(150)
  return [...dados.denuncias].sort((a, b) => new Date(b.data) - new Date(a.data))
}

// futuro: PATCH /api/denuncias/{id}/status (ADMIN)
export async function alterarStatusDenuncia(id, status) {
  await esperar(150)
  const denuncia = dados.denuncias.find((d) => d.id === id)
  denuncia.status = status
  salvar()
  return denuncia
}
