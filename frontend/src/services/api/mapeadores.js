// Convertem as respostas da API para o formato que as telas já usam.
// Assim as telas não mudam quando trocamos os dados de demonstração pela API.

export const soData = (dataHora) => (dataHora ? String(dataHora).slice(0, 10) : '')

export function separarNome(nomeCompleto = '') {
  const partes = nomeCompleto.trim().split(/\s+/)
  return { nome: partes[0] || '', sobrenome: partes.slice(1).join(' ') }
}

// UsuarioAutenticacaoInfoResponse / UsuarioInfoResponse -> usuário da tela
export function paraUsuario(r, extra = {}) {
  return {
    id: r.id,
    ...separarNome(r.nomeCompleto),
    email: r.email,
    telefone: r.telefone ?? '',
    perfil: r.perfil ?? r.tipoPerfil,
    ativo: r.ativo ?? true,
    nascimento: r.nascimento,
    endereco: r.endereco,
    dataCriacao: r.dataCriacao,
    ...extra,
  }
}

// AnimalResponse -> animal da tela
export function paraAnimal(r) {
  if (!r) return null
  return {
    id: r.id,
    nome: r.nome,
    sexo: r.sexo,
    corPredominante: r.corPredominante,
    castrado: r.castrado,
    vacinado: r.vacinado,
    descricao: r.descricao,
    fotoUrl: r.fotoUrl || '',
    idadeAnimal: r.idade,
    porteAnimal: r.porte,
    especieAnimal: r.especie,
  }
}

// PublicacaoResponse (+ animal e ONG, se houver) -> publicação da tela
export function paraPublicacao(r, animal, ong) {
  const a = animal || {}
  return {
    id: r.id,
    titulo: r.titulo,
    descricao: r.descricao,
    tipoPublicacao: r.tipo,
    status: r.status,
    data: r.data,
    animal: {
      id: r.animalId,
      nome: r.animalNome || a.nome || 'Sem nome',
      sexo: a.sexo,
      corPredominante: a.corPredominante,
      castrado: a.castrado,
      vacinado: a.vacinado,
      descricao: a.descricao,
      fotoUrl: r.fotoUrl || r.animalFotoUrl || a.fotoUrl || '',
      idadeAnimal: a.idadeAnimal,
      porteAnimal: a.porteAnimal,
      especieAnimal: a.especieAnimal,
    },
    endereco: r.endereco || {},
    autor: {
      usuarioId: r.usuarioId,
      nome: ong ? ong.nome : r.usuarioNome,
      telefone: r.usuarioTelefone,
      exibirTelefone: Boolean(r.usuarioTelefone),
      ...(ong ? { ongId: ong.id } : {}),
    },
  }
}

// OngResponse -> ONG da tela (o backend ainda não tem aprovação de ONG)
export function paraOng(r) {
  return {
    id: r.id,
    status: 'APROVADA',
    usuarioId: r.usuarioId,
    nome: r.nome,
    razaoSocial: r.razaoSocial,
    cnpj: r.cnpj,
    chavePix: r.chavePix || '',
    descricao: r.descricao,
    endereco: r.endereco || {},
    contato: {},
  }
}

// CampanhaResponse -> campanha da tela
export function paraCampanha(r) {
  return {
    id: r.id,
    ongId: r.ongId,
    ongNome: r.ongNome,
    titulo: r.titulo,
    descricao: r.descricao,
    dataInicio: soData(r.inicio),
    dataFim: soData(r.fim),
    ativo: r.ativo,
  }
}

// DenunciaResponse -> denúncia da tela
export function paraDenuncia(r) {
  return {
    id: r.id,
    titulo: r.titulo,
    descricao: r.descricao,
    fotoUrl: r.fotoUrl || '',
    data: r.data,
    status: r.status,
    endereco: r.endereco || {},
  }
}

// endereço da tela -> EnderecoDto (estado, cidade, bairro e rua são obrigatórios)
export function paraEnderecoDto(e = {}) {
  return {
    estado: e.estado || 'SC',
    cidade: e.cidade,
    bairro: e.bairro,
    rua: e.rua || e.complemento || e.bairro,
    complemento: e.complemento || '',
  }
}
