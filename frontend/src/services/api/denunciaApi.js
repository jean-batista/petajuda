import { requisicao, formularioComFoto } from '../http'
import { paraDenuncia, paraEnderecoDto } from './mapeadores'

export async function criarDenuncia({ titulo, descricao, fotoUrl, endereco }) {
  if (!fotoUrl) throw new Error('Anexe uma foto ou evidência para enviar a denúncia.')
  const r = await requisicao('/api/v1/denuncias', {
    metodo: 'POST',
    form: formularioComFoto({ titulo, descricao, endereco: paraEnderecoDto(endereco) }, fotoUrl),
  })
  return paraDenuncia(r)
}

// a API só permite consultar denúncias como ADMIN
export async function consultarDenuncia() {
  return null
}

export async function listarDenuncias() {
  const lista = ((await requisicao('/api/v1/denuncias')) || []).map(paraDenuncia)
  return lista.sort((a, b) => new Date(b.data) - new Date(a.data))
}

export async function alterarStatusDenuncia(id, status) {
  return paraDenuncia(await requisicao(`/api/v1/denuncias/${id}/status`, { metodo: 'PATCH', params: { status } }))
}
