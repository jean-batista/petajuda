import { requisicao, salvarToken, lerToken } from '../http'
import { paraUsuario, paraEnderecoDto } from './mapeadores'
import { buscarOngDoUsuario } from './ongApi'

// O backend ainda não troca o perfil para ONG ao cadastrar uma instituição;
// por isso, quem tem ONG vinculada é tratado como ONG aqui no front.
async function completarPerfil(usuario) {
  if (usuario.perfil === 'ADMIN') return usuario
  const ong = await buscarOngDoUsuario(usuario.id)
  return ong ? { ...usuario, perfil: 'ONG', ongId: ong.id } : usuario
}

async function carregarMe() {
  return completarPerfil(paraUsuario(await requisicao('/api/v1/usuarios/me')))
}

export async function login(email, senha) {
  const r = await requisicao('/api/v1/autenticacao/login', { metodo: 'POST', json: { email: email.trim(), senha } })
  salvarToken(r.token)
  return carregarMe()
}

export function sair() {
  salvarToken(null)
}

function cadastroRequest({ nome, sobrenome, email, telefone, senha, nascimento, endereco }) {
  return { nome, sobrenome, telefone, nascimento, email: email.trim(), senha, endereco: paraEnderecoDto(endereco) }
}

export async function registrar(dados) {
  await requisicao('/api/v1/autenticacao/cadastro', { metodo: 'POST', json: cadastroRequest(dados) })
  return login(dados.email, dados.senha)
}

// cadastra o usuário responsável, entra e depois cria a ONG vinculada a ele
export async function registrarOng({ responsavel, ong }) {
  await requisicao('/api/v1/autenticacao/cadastro', {
    metodo: 'POST', json: cadastroRequest({ ...responsavel, endereco: ong.endereco }),
  })
  await login(responsavel.email, responsavel.senha)
  await requisicao('/api/v1/ongs', {
    metodo: 'POST',
    json: { nome: ong.nome, razaoSocial: ong.razaoSocial, cnpj: ong.cnpj, chavePix: ong.chavePix, descricao: ong.descricao, endereco: paraEnderecoDto(ong.endereco) },
  })
  return carregarMe()
}

export async function recuperarSenha() {
  throw new Error('A recuperação de senha ainda não está disponível. Fale com a administração.')
}

export async function buscarUsuario() {
  if (!lerToken()) return null
  try {
    return await carregarMe()
  } catch {
    salvarToken(null)
    return null
  }
}

export async function atualizarPerfil(_id, { nome, sobrenome, telefone }) {
  const atual = await requisicao('/api/v1/usuarios/me')
  await requisicao('/api/v1/usuarios/me', {
    metodo: 'PUT',
    json: { nome, sobrenome, telefone, nascimento: atual.nascimento, endereco: paraEnderecoDto(atual.endereco) },
  })
  return carregarMe()
}

export async function alterarSenha(_id, senhaAtual, novaSenha) {
  await requisicao('/api/v1/usuarios/me/senha', { metodo: 'PATCH', json: { senhaAntiga: senhaAtual, senhaNova: novaSenha } })
}

export async function listarUsuarios() {
  const pagina = await requisicao('/api/v1/usuarios', { params: { size: 200 } })
  return (pagina?.content || pagina || []).map((u) => paraUsuario(u))
}

export async function alterarStatusUsuario(id, ativo) {
  await requisicao(`/api/v1/usuarios/${id}/${ativo ? 'reativar' : 'desativar'}`, { metodo: 'PATCH' })
}
