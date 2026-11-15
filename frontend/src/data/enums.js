export const TIPO_PUBLICACAO = {
    PERDIDO: { label: 'Perdido', classe: 'bg-orange-100 text-orange-700' },
    ENCONTRADO: { label: 'Encontrado', classe: 'bg-green-100 text-green-700' },
    ADOCAO: { label: 'Adoção', classe: 'bg-sky-100 text-sky-700' },
}

// mesmos valores e rótulos do enum EspecieAnimal do backend
export const ESPECIE = {
    CACHORRO: 'Cachorro',
    GATO: 'Gato',
    PASSARO: 'Pássaro / Ave',
    EQUINO: 'Equino (Cavalo / Pônei)',
    ROEDOR: 'Roedor (Coelho / Hamster)',
    REPTEIS: 'Réptil (Jabuti / Tartaruga)',
    OUTRO: 'Outro',
}
export const PORTE = { PEQUENO: 'Pequeno', MEDIO: 'Médio', GRANDE: 'Grande' }
export const IDADE = { FILHOTE: 'Filhote', ADULTO: 'Adulto', IDOSO: 'Idoso' }

export const CIDADES = [
    'Tubarão', 'Laguna', 'Capivari de Baixo', 'Gravatal', 'Braço do Norte',
    'Imbituba', 'Jaguaruna', 'Orleans', 'Armazém', 'São Ludgero',
]

export const SEXO = { MACHO: 'Macho', FEMEA: 'Fêmea' }

export const STATUS_PUBLICACAO = {
    ATIVO: { label: 'Ativo', classe: 'bg-green-100 text-green-700' },
    RESOLVIDO: { label: 'Resolvido', classe: 'bg-stone-200 text-stone-600' },
}

// texto do botão "marcar como..." conforme o tipo da publicação (RF09)
export const ROTULO_RESOLVIDO = {
    PERDIDO: 'encontrado',
    ENCONTRADO: 'devolvido ao tutor',
    ADOCAO: 'adotado',
}

export const STATUS_DENUNCIA = {
    PENDENTE: { label: 'Pendente', classe: 'bg-amber-100 text-amber-700' },
    EM_ANALISE: { label: 'Em análise', classe: 'bg-sky-100 text-sky-700' },
    CONCLUIDA: { label: 'Concluída', classe: 'bg-green-100 text-green-700' },
    REJEITADA: { label: 'Rejeitada', classe: 'bg-stone-200 text-stone-600' },
}

export const STATUS_ONG = {
    PENDENTE: { label: 'Pendente', classe: 'bg-amber-100 text-amber-700' },
    APROVADA: { label: 'Aprovada', classe: 'bg-green-100 text-green-700' },
    REPROVADA: { label: 'Reprovada', classe: 'bg-red-100 text-red-700' },
}

export const PERFIL = {
    USUARIO_COMUM: 'Usuário comum',
    ONG: 'ONG / Protetor',
    ADMIN: 'Administrador',
}

// mensagem amigável a partir de um erro (inclusive o formato de erro da API Spring)
export function mensagemDeErro(erro, padrao = 'Não foi possível concluir. Tente novamente.') {
    const corpo = erro?.resposta ?? erro
    if (corpo?.errors?.length) return corpo.errors.map((e) => e.mensagem).join(' ')
    return corpo?.message || padrao
}
