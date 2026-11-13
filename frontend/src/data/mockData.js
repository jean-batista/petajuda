export const publicacoes = [
    {
        id: 'p1',
        titulo: 'Cão caramelo perdido perto do Farol Shopping',
        descricao: 'Fugiu do pátio durante a chuva de ontem à noite. Atende por Thor, coleira vermelha.',
        tipoPublicacao: 'PERDIDO',
        status: 'ATIVO',
        data: '2026-10-30T19:30:00',
        animal: {
            id: 'a1', nome: 'Thor', sexo: 'MACHO', corPredominante: 'Caramelo',
            castrado: true, vacinado: true,
            descricao: 'Dócil, mancha preta no peito.',
            fotoUrl: '',
            idadeAnimal: 'ADULTO', porteAnimal: 'MEDIO', especieAnimal: 'CACHORRO',
        },
        endereco: { estado: 'SC', cidade: 'Tubarão', bairro: 'Vila Moema', rua: 'Rua Lauro Müller', complemento: 'Próximo à praça' },
        autor: { usuarioId: 'u1', nome: 'João Silva', telefone: '48999990001', exibirTelefone: true },
    },
    {
        id: 'p2',
        titulo: 'Gatinha encontrada no Centro de Laguna',
        descricao: 'Apareceu assustada na porta da loja. Está segura comigo esperando o tutor.',
        tipoPublicacao: 'ENCONTRADO',
        status: 'ATIVO',
        data: '2026-11-01T10:15:00',
        animal: {
            id: 'a2', nome: 'Sem nome', sexo: 'FEMEA', corPredominante: 'Tricolor',
            castrado: false, vacinado: false,
            descricao: 'Muito mansa, olhos verdes.',
            fotoUrl: '',
            idadeAnimal: 'FILHOTE', porteAnimal: 'PEQUENO', especieAnimal: 'GATO',
        },
        endereco: { estado: 'SC', cidade: 'Laguna', bairro: 'Centro', rua: 'Rua Gustavo Richard', complemento: '' },
        autor: { usuarioId: 'u4', nome: 'Ana Souza', telefone: '48999990002', exibirTelefone: true },
    },
    {
        id: 'p3',
        titulo: 'Bento procura um lar',
        descricao: 'Resgatado há 3 meses, já castrado e vacinado. Ótimo com crianças.',
        tipoPublicacao: 'ADOCAO',
        status: 'ATIVO',
        data: '2026-10-25T14:00:00',
        animal: {
            id: 'a3', nome: 'Bento', sexo: 'MACHO', corPredominante: 'Preto',
            castrado: true, vacinado: true,
            descricao: 'Brincalhão e carinhoso.',
            fotoUrl: '',
            idadeAnimal: 'ADULTO', porteAnimal: 'GRANDE', especieAnimal: 'CACHORRO',
        },
        endereco: { estado: 'SC', cidade: 'Capivari de Baixo', bairro: 'Centro', rua: 'Av. Nereu Ramos', complemento: '' },
        autor: { usuarioId: 'u2', nome: 'Patas Solidárias', telefone: '48999990003', exibirTelefone: true, ongId: 'o1' },
    },
    {
        id: 'p4',
        titulo: 'Mel, gatinha dócil para adoção',
        descricao: 'Resgatada ainda filhote, hoje está saudável, castrada e acostumada com outros gatos.',
        tipoPublicacao: 'ADOCAO',
        status: 'ATIVO',
        data: '2026-10-28T09:00:00',
        animal: {
            id: 'a4', nome: 'Mel', sexo: 'FEMEA', corPredominante: 'Laranja',
            castrado: true, vacinado: true,
            descricao: 'Calma, gosta de colo.',
            fotoUrl: '',
            idadeAnimal: 'ADULTO', porteAnimal: 'PEQUENO', especieAnimal: 'GATO',
        },
        endereco: { estado: 'SC', cidade: 'Imbituba', bairro: 'Vila Nova', rua: 'Rua Ernani Cotrim', complemento: '' },
        autor: { usuarioId: 'u2', nome: 'Patas Solidárias', telefone: '48999990003', exibirTelefone: true, ongId: 'o1' },
    },
    {
        id: 'p5',
        titulo: 'Pipoca sumiu no bairro Centro',
        descricao: 'Saiu pelo portão aberto no sábado à tarde. Usa coleira azul com plaquinha.',
        tipoPublicacao: 'PERDIDO',
        status: 'ATIVO',
        data: '2026-11-02T16:40:00',
        animal: {
            id: 'a5', nome: 'Pipoca', sexo: 'FEMEA', corPredominante: 'Branco',
            castrado: true, vacinado: true,
            descricao: 'Pequena e medrosa, não costuma se aproximar de estranhos.',
            fotoUrl: '',
            idadeAnimal: 'IDOSO', porteAnimal: 'PEQUENO', especieAnimal: 'CACHORRO',
        },
        endereco: { estado: 'SC', cidade: 'Braço do Norte', bairro: 'Centro', rua: 'Rua Felipe Schmidt', complemento: 'Perto da igreja matriz' },
        autor: { usuarioId: 'u5', nome: 'Carla Mendes', telefone: '48999990004', exibirTelefone: true },
    },
    {
        id: 'p6',
        titulo: 'Cachorro encontrado na estrada de Gravatal',
        descricao: 'Estava andando na beira da SC-370, muito cansado. Já foi alimentado e está abrigado.',
        tipoPublicacao: 'ENCONTRADO',
        status: 'ATIVO',
        data: '2026-11-02T08:20:00',
        animal: {
            id: 'a6', nome: 'Sem nome', sexo: 'MACHO', corPredominante: 'Marrom',
            castrado: false, vacinado: false,
            descricao: 'Porte grande, orelhas caídas, sem coleira.',
            fotoUrl: '',
            idadeAnimal: 'ADULTO', porteAnimal: 'GRANDE', especieAnimal: 'CACHORRO',
        },
        endereco: { estado: 'SC', cidade: 'Gravatal', bairro: 'Termas', rua: 'SC-370', complemento: 'Próximo ao posto' },
        autor: { usuarioId: 'u6', nome: 'Rafael Costa', telefone: '48999990005', exibirTelefone: true },
    },
]

export const ongs = [
    {
        id: 'o1', status: 'APROVADA', usuarioId: 'u2', contato: { telefone: '48999990003', email: 'contato@patassolidarias.org' }, nome: 'Patas Solidárias', razaoSocial: 'Associação Patas Solidárias',
        cnpj: '12345678000199', chavePix: 'contato@patassolidarias.org',
        descricao: 'Resgate e castração de animais de rua em Tubarão e região.',
        endereco: { estado: 'SC', cidade: 'Tubarão', bairro: 'Centro', rua: 'Rua Altamiro Guimarães', complemento: 'Sala 102' },
    },
    {
        id: 'o2', status: 'APROVADA', usuarioId: 'u7', contato: { telefone: '48999990006', email: 'abrigo@amigofiel.org' }, nome: 'Abrigo Amigo Fiel', razaoSocial: 'Associação Protetora Amigo Fiel',
        cnpj: '98765432000155', chavePix: '98765432000155',
        descricao: 'Abrigo com mais de 40 animais resgatados em Laguna, focado em adoção responsável.',
        endereco: { estado: 'SC', cidade: 'Laguna', bairro: 'Mar Grosso', rua: 'Rua Senador Galotti', complemento: '' },
    },
    {
        id: 'o3', status: 'PENDENTE', usuarioId: 'u8', contato: { telefone: '48999990007', email: 'contato@focinhosdocentro.org' },
        nome: 'Focinhos do Centro', razaoSocial: 'Associação Focinhos do Centro',
        cnpj: '11222333000181', chavePix: '11222333000181',
        descricao: 'Protetores independentes de Capivari de Baixo que resgatam e castram animais de rua.',
        endereco: { estado: 'SC', cidade: 'Capivari de Baixo', bairro: 'Santa Rosa', rua: 'Rua Pedro Bianchini', complemento: '' },
    },
]

export const campanhas = [
    {
        id: 'c1', ongId: 'o1', titulo: 'Feira de Adoção no Farol Shopping',
        descricao: 'Mais de 20 cães e gatos esperando uma família.',
        dataInicio: '2026-11-15', dataFim: '2026-11-15', ativo: true,
    },
    {
        id: 'c2', ongId: 'o2', titulo: 'Vaquinha da ração de dezembro',
        descricao: 'Meta de 500 kg de ração para manter o abrigo até o fim do ano.',
        dataInicio: '2026-11-01', dataFim: '2026-12-20', ativo: true,
    },
]

// Contas de demonstração (somente mock). Com o backend, a senha fica em BCrypt no servidor.
export const usuarios = [
    { id: 'u1', nome: 'João', sobrenome: 'Silva', email: 'usuario@petajuda.com', telefone: '48999990001', senha: '123456', perfil: 'USUARIO_COMUM', ativo: true, dataCriacao: '2026-10-01T10:00:00' },
    { id: 'u2', nome: 'Maria', sobrenome: 'Santos', email: 'ong@petajuda.com', telefone: '48999990003', senha: '123456', perfil: 'ONG', ongId: 'o1', ativo: true, dataCriacao: '2026-10-02T10:00:00' },
    { id: 'u3', nome: 'Administrador', sobrenome: 'Pet Ajuda', email: 'admin@petajuda.com', telefone: '48999990000', senha: '123456', perfil: 'ADMIN', ativo: true, dataCriacao: '2026-09-20T10:00:00' },
    { id: 'u4', nome: 'Ana', sobrenome: 'Souza', email: 'ana@exemplo.com', telefone: '48999990002', senha: '123456', perfil: 'USUARIO_COMUM', ativo: true, dataCriacao: '2026-10-05T10:00:00' },
    { id: 'u5', nome: 'Carla', sobrenome: 'Mendes', email: 'carla@exemplo.com', telefone: '48999990004', senha: '123456', perfil: 'USUARIO_COMUM', ativo: true, dataCriacao: '2026-10-08T10:00:00' },
    { id: 'u6', nome: 'Rafael', sobrenome: 'Costa', email: 'rafael@exemplo.com', telefone: '48999990005', senha: '123456', perfil: 'USUARIO_COMUM', ativo: true, dataCriacao: '2026-10-10T10:00:00' },
    { id: 'u7', nome: 'Paulo', sobrenome: 'Ramos', email: 'abrigo@amigofiel.org', telefone: '48999990006', senha: '123456', perfil: 'ONG', ongId: 'o2', ativo: true, dataCriacao: '2026-10-03T10:00:00' },
    { id: 'u8', nome: 'Luciana', sobrenome: 'Pires', email: 'contato@focinhosdocentro.org', telefone: '48999990007', senha: '123456', perfil: 'ONG', ongId: 'o3', ativo: true, dataCriacao: '2026-11-10T10:00:00' },
]

export const denuncias = [
    {
        id: 'd1', descricao: 'Cachorro preso em corrente curta, sem água nem abrigo, há vários dias.',
        fotoUrl: '', data: '2026-11-08T15:20:00', status: 'PENDENTE',
        endereco: { estado: 'SC', cidade: 'Tubarão', bairro: 'Humaitá', rua: 'Rua Engenheiro Annes Gualberto', complemento: 'Casa azul sem muro' },
    },
    {
        id: 'd2', descricao: 'Vários gatos abandonados dentro de uma casa desocupada.',
        fotoUrl: '', data: '2026-11-05T09:10:00', status: 'EM_ANALISE',
        endereco: { estado: 'SC', cidade: 'Laguna', bairro: 'Magalhães', rua: 'Rua João Pinto', complemento: '' },
    },
]
