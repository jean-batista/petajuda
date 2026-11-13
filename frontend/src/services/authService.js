import dados, { salvar, gerarId, esperar } from '../data/store'

const semSenha = ({ senha: _senha, ...resto }) => resto // nunca devolve a senha para a tela
const normalizar = (email) => email.trim().toLowerCase()

// futuro: POST /api/auth/login
export async function login(email, senha) {
  await esperar()
  const usuario = dados.usuarios.find((u) => normalizar(u.email) === normalizar(email))
  if (!usuario || usuario.senha !== senha) throw new Error('E-mail ou senha inválidos.')
  if (!usuario.ativo) throw new Error('Esta conta está suspensa. Entre em contato com a administração.')
  return semSenha(usuario)
}

// futuro: POST /api/auth/register
export async function registrar({ nome, sobrenome, email, telefone, senha }) {
  await esperar()
  if (dados.usuarios.some((u) => normalizar(u.email) === normalizar(email))) {
    throw new Error('Já existe uma conta com este e-mail.')
  }
  const usuario = {
    id: gerarId('u'), nome, sobrenome, email: email.trim(), telefone, senha,
    perfil: 'USUARIO_COMUM', ativo: true, dataCriacao: new Date().toISOString(),
  }
  dados.usuarios.push(usuario)
  salvar()
  return semSenha(usuario)
}

// futuro: POST /api/auth/register-ong  (cria Usuário + perfil ONG, que fica PENDENTE até o admin aprovar)
export async function registrarOng({ responsavel, ong }) {
  await esperar()
  if (dados.usuarios.some((u) => normalizar(u.email) === normalizar(responsavel.email))) {
    throw new Error('Já existe uma conta com este e-mail.')
  }
  if (dados.ongs.some((o) => o.cnpj === ong.cnpj)) {
    throw new Error('Já existe uma instituição cadastrada com este CNPJ.')
  }
  const usuarioId = gerarId('u')
  const ongId = gerarId('o')
  dados.ongs.push({
    id: ongId, status: 'PENDENTE', usuarioId,
    contato: { telefone: responsavel.telefone, email: responsavel.email.trim() },
    nome: ong.nome, razaoSocial: ong.razaoSocial, cnpj: ong.cnpj, chavePix: ong.chavePix,
    descricao: ong.descricao, endereco: ong.endereco,
  })
  const usuario = {
    id: usuarioId, nome: responsavel.nome, sobrenome: responsavel.sobrenome,
    email: responsavel.email.trim(), telefone: responsavel.telefone, senha: responsavel.senha,
    perfil: 'ONG', ongId, ativo: true, dataCriacao: new Date().toISOString(),
  }
  dados.usuarios.push(usuario)
  salvar()
  return semSenha(usuario)
}

// futuro: endpoint de recuperação de senha (envia um token por e-mail)
export async function recuperarSenha(email) {
  await esperar()
  // por segurança a resposta é a mesma exista ou não a conta
  return { enviado: true, email: email.trim() }
}

// futuro: GET /api/usuarios/me
export async function buscarUsuario(id) {
  const usuario = dados.usuarios.find((u) => u.id === id)
  return usuario && usuario.ativo ? semSenha(usuario) : null
}

// futuro: PUT /api/usuarios/me
export async function atualizarPerfil(id, { nome, sobrenome, telefone }) {
  await esperar()
  const usuario = dados.usuarios.find((u) => u.id === id)
  Object.assign(usuario, { nome, sobrenome, telefone })
  salvar()
  return semSenha(usuario)
}

// futuro: PATCH /api/usuarios/me/senha
export async function alterarSenha(id, senhaAtual, novaSenha) {
  await esperar()
  const usuario = dados.usuarios.find((u) => u.id === id)
  if (usuario.senha !== senhaAtual) throw new Error('A senha atual está incorreta.')
  usuario.senha = novaSenha
  salvar()
}

// futuro: GET /api/usuarios (ADMIN)
export async function listarUsuarios() {
  await esperar(150)
  return dados.usuarios.map(semSenha)
}

// futuro: PATCH /api/usuarios/{id}/status (ADMIN)
export async function alterarStatusUsuario(id, ativo) {
  await esperar(150)
  const usuario = dados.usuarios.find((u) => u.id === id)
  usuario.ativo = ativo
  salvar()
  return semSenha(usuario)
}
