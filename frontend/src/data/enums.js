// Definições de enums e constantes sincronizadas com o Backend do Pet Ajuda

export const TIPO_PUBLICACAO = {
    PERDIDO: {
        label: 'Perdido',
        classe: 'bg-rose-100 text-rose-700 border-rose-200',
        botaoClasse: 'bg-rose-600 hover:bg-rose-700',
    },
    ENCONTRADO: {
        label: 'Encontrado',
        classe: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        botaoClasse: 'bg-emerald-600 hover:bg-emerald-700',
    },
    ADOCAO: {
        label: 'Adoção',
        classe: 'bg-sky-100 text-sky-700 border-sky-200',
        botaoClasse: 'bg-sky-600 hover:bg-sky-700',
    },
}

export const ESPECIE = {
    CACHORRO: 'Cachorro',
    GATO: 'Gato',
    PASSARO: 'Pássaro / Ave',
    EQUINO: 'Equino (Cavalo / Pônei)',
    ROEDOR: 'Roedor (Coelho / Hamster)',
    REPTEIS: 'Réptil (Jabuti / Tartaruga)',
    OUTRO: 'Outro'
}

export const ESPECIE_ANIMAL = ESPECIE

export const PORTE = { PEQUENO: 'Pequeno', MEDIO: 'Médio', GRANDE: 'Grande' }
export const PORTE_ANIMAL = PORTE

export const IDADE = { FILHOTE: 'Filhote', ADULTO: 'Adulto', IDOSO: 'Idoso' }
export const IDADE_ANIMAL = IDADE

export const SEXO = { MACHO: 'Macho', FEMEA: 'Fêmea' }
export const SEXO_ANIMAL = SEXO

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
    PENDENTE: { label: 'Pendente', classe: 'bg-amber-100 text-amber-800 border-amber-200' },
    EM_ANALISE: { label: 'Em análise', classe: 'bg-sky-100 text-sky-800 border-sky-200' },
    CONCLUIDA: { label: 'Concluída', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    REJEITADA: { label: 'Rejeitada', classe: 'bg-rose-100 text-rose-800 border-rose-200' },
}

export const PERFIL = {
    USUARIO_COMUM: 'Usuário comum',
    ONG: 'ONG / Protetor',
    ADMIN: 'Administrador',
}

export const METHOD_TYPE = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
}