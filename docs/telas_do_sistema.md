# 📱 Mapeamento de Telas da Aplicação — Pet Ajuda AMUREL
 
> **Tech Stack Frontend:** React + Tailwind CSS + Lucide React (Ícones)

## 🌐 1. Zona Pública (Visitantes e Comunidade)

### 🖥️ Tela 01: Home / Feed Principal de Publicações

- **Rota:** `/` ou `/feed`
    
- **Objetivo:** Ponto de entrada do sistema. Apresenta o feed em grid/cards com os animais perdidos, encontrados e disponíveis para adoção na região da AMUREL.
    
- **Componentes Principais:**
    
    - **Barra de Busca e Filtros Rápidos (Topo):**
        
        - Abas/Pills: _Todos_, _Perdidos_ (Laranja), _Encontrados_ (Verde), _Para Adoção_ (Azul).
            
        - Selects de filtro: Cidade (Tubarão, Capivari, Gravatal), Bairro, Espécie (_Cão_, _Gato_, _Pássaro_), Porte.
            
    - **Grid de Cards de Animais:**
        
        - Foto principal do pet.
            
        - Badge de Status/Tipo (_PERDIDO_, _ENCONTRADO_, _ADOÇÃO_).
            
        - Nome (ou apelido do post) e espécie/porte.
            
        - Bairro e Cidade do registro.
            
        - Data da publicação.
            
        - Botão: _"Ver Detalhes"_.
            

### 🖥️ Tela 02: Detalhes da Publicação & Contato Direct

- **Rota:** `/publicacoes/:id` (ou Modal sobreposto ao Feed)
    
- **Objetivo:** Exibir a ficha completa do animal e disponibilizar o canal direto de contato com o tutor/resgatante.
    
- **Componentes Principais:**
    
    - Foto ampliada do animal.
        
    - Dados completos do pet: Nome, Espécie, Sexo, Porte, Idade, Castrado/Vacinado.
        
    - Texto descritivo com relatos do local, horário ou marcas particulares.
        
    - Endereço do registro: Bairro, Cidade, Rua/Ponto de referência.
        
    - Card do Anunciante (Nome do usuário ou ONG responsável).
        
    - **Botão Destaque (Call to Action):** _"Chamar no WhatsApp"_ (Abre o link `wa.me/55...` direto no celular do usuário).
        

### 🖥️ Tela 03: Diretório de ONGs e Protetores

- **Rota:** `/ongs`
    
- **Objetivo:** Apresentar as ONGs e protetores parceiros validados na região da AMUREL.
    
- **Componentes Principais:**
    
    - Filtro por cidade da AMUREL.
        
    - Cards institucionais com: Nome/Razão Social, Bairro/Cidade, resumo da causa, total de animais sob custódia e chave Pix rápida.
        
    - Botão: _"Conhecer Trabalho & Doar"_.
        

### 🖥️ Tela 04: Perfil Público da ONG

- **Rota:** `/ongs/:id`
    
- **Objetivo:** Página institucional da ONG para transparência, divulgação de doações (Pix) e adoções.
    
- **Componentes Principais:**
    
    - Banner e foto de perfil da ONG.
        
    - História/Apresentação e links de redes sociais (Instagram/Facebook).
        
    - **Box de Doação Pix:** Exibição da chave Pix + QR Code gerado.
        
    - **Aba 1 - Animais para Adoção:** Grid de pets sob cuidados da instituição.
        
    - **Aba 2 - Campanhas Ativas:** Lista de vaquinhas, feirinhas e mutirões vigentes.
        

### 🖥️ Tela 05: Central de Denúncia Anônima (Canal Privado)

- **Rota:** `/denunciar`
    
- **Objetivo:** Formulário simples e seguro para que qualquer cidadão relate maus-tratos ou abandono de forma sigilosa.
    
- **Componentes Principais:**
    
    - Aviso de confidencialidade: _"Esta denúncia é 100% anônima e será analisada apenas pelos administradores."_
        
    - Área de Upload: Campo para anexo de foto/comprovante visual.
        
    - Formulário de localização: Cidade, Bairro, Rua e Ponto de Referência.
        
    - Campo de texto: Descrição detalhada da ocorrência.
        
    - Botão de envio com feedback visual de confirmação.
        

## 🔑 2. Zona de Autenticação

### 🖥️ Tela 06: Tela de Login

- **Rota:** `/login`
    
- **Componentes:** Campo de e-mail, senha, botão _"Entrar"_, link _"Esqueci minha senha"_ e atalhos para _"Criar conta"_ ou _"Cadastrar minha ONG"_.
    

### 🖥️ Tela 07: Cadastro de Usuário Comum

- **Rota:** `/cadastrar`
    
- **Componentes:** Nome, Sobrenome, E-mail, Telefone (WhatsApp), Senha, Confirmação de Senha e checkbox dos Termos de Uso.
    

### 🖥️ Tela 08: Cadastro Institucional (ONG / Protetor)

- **Rota:** `/cadastrar-ong`
    
- **Componentes:**
    
    - Passos 1 (Dados do Responsável): Nome, e-mail, telefone, senha.
        
    - Passo 2 (Dados da Instituição): Razão Social, CNPJ, Chave Pix, Descrição, Endereço Completo (Rua, Bairro, Cidade).
        
    - Aviso: _"O perfil passará por análise antes de ser exibido publicamente."_
        

### 🖥️ Tela 09: Recuperação de Senha

- **Rota:** `/recuperar-senha`
    
- **Componentes:** Input de e-mail para envio do token de redefinição.
    

## 👤 3. Zona do Usuário & ONG (Painel Logado)

> [!NOTE] Permissões O Usuário Comum acessa a gestão dos seus posts. A ONG possui a mesma visão com o acréscimo da aba de _Campanhas_.

### 🖥️ Tela 10: Meu Perfil / Minha Conta

- **Rota:** `/painel/perfil`
    
- **Componentes:** Edição de dados pessoais, telefone/WhatsApp, atualização de senha e dados institucionais (se for ONG).
    

### 🖥️ Tela 11: Meus Animais e Publicações

- **Rota:** `/painel/minhas-publicacoes`
    
- **Componentes:**
    
    - Tabela/Lista com todas as publicações criadas pelo usuário.
        
    - Tag de Status (_ATIVO_ / _RESOLVIDO_).
        
    - Botões de Ação:
        
        - _"Marcar como Resolvido"_ (Gera o encerramento do post no feed público).
            
        - _"Editar"_.
            
        - _"Excluir"_.
            
    - Botão Destaque: `+ Criar Nova Publicação`.
        

### 🖥️ Tela 12: Formulário Unificado: Cadastrar Animal & Publicação

- **Rota:** `/painel/publicacoes/nova`
    
- **Objetivo:** Cadastro dinâmico em 2 etapas para facilitar a criação de novos posts.
    
- **Componentes:**
    
    - **Etapa 1 (Ficha do Pet):** Nome, Espécie (_Cão, Gato, Pássaro_), Sexo, Porte, Idade aproximada, Castrado/Vacinado, Foto do Animal.
        
    - **Etapa 2 (Dados da Publicação):** Tipo (_Perdido, Encontrado, Adoção_), Título do post, Descrição do ocorrido, Cidade, Bairro e Ponto de Referência.
        

### 🖥️ Tela 13: Criar/Editar Campanha (Exclusivo ONG)

- **Rota:** `/painel/campanhas/nova`
    
- **Componentes:** Título da ação, Descrição da necessidade, Data de Início, Data de Término, Status (_Ativa/Inativa_).
    

## 🛡️ 4. Zona Administrativa (Restrita ao ADMIN)

> [!WARNING] Acesso Restrito Telas acessíveis apenas por usuários com a role `ROLE_ADMIN`.

### 🖥️ Tela 14: Dashboard Administrador

- **Rota:** `/admin/dashboard`
    
- **Componentes:**
    
    - **Cards de Métricas:** Total de Usuários, Total de ONGs, Animais Resgatados/Adotados, Denúncias Pendentes.
        
    - Atalhos para moderação rápida.
        

### 🖥️ Tela 15: Central de Triagem de Denúncias

- **Rota:** `/admin/denuncias`
    
- **Objetivo:** Painel sigiloso para análise e alteração do status das denúncias registradas.
    
- **Componentes:**
    
    - Tabela com: Data de envio, Cidade/Bairro, Foto de evidência e Status (_PENDENTE_, _EM_ANALISE_, _CONCLUIDA_, _REJEITADA_).
        
    - Modal de detalhes: Exibe o relato completo e o endereço exato da ocorrência.
        
    - Select de alteração de status com botão de salvar.
        

### 🖥️ Tela 16: Aprovação e Moderação de ONGs

- **Rota:** `/admin/ongs`
    
- **Objetivo:** Validar o CNPJ e perfil de novas ONGs antes de liberá-las na plataforma.
    
- **Componentes:**
    
    - Lista de ONGs pendentes de aprovação.
        
    - Botão _"Aprovar Cadastros"_ ou _"Reprovar/Solicitar Ajustes"_.
        

### 🖥️ Tela 17: Moderação de Conteúdo e Usuários

- **Rota:** `/admin/moderacao`
    
- **Componentes:** Busca de usuários cadastrados e listagem geral de posts com opção de exclusão forçada (em caso de violação de termos de uso ou spam).
    
