# 📄 Especificação de Requisitos Funcionais (RF)

**Projeto:** Pet Ajuda  — Plataforma de Apoio e Proteção Animal

**Escopo:** Aplicação Web / Mobile para auxílio e centralização de animais

## 1. Módulo de Autenticação e Gestão de Usuários

- [ ] **RF01 - Cadastro de Usuários:** O sistema deve permitir o cadastro de usuários no sistema, coletando dados essenciais de identificação e contato.
    
- [ ] **RF02 - Autenticação (Login e Logout):** O sistema deve permitir que usuários autenticados realizem login e logout com segurança.
    
- [ ] **RF03 - Visualização e Edição do Perfil:** O sistema deve permitir que os usuários visualizem e editem seus próprios dados cadastrais.
    
- [ ] **RF04 - Recuperação de Senha:** O sistema deve oferecer um mecanismo para que o usuário redefina ou recupere sua senha de acesso em caso de esquecimento.
    
- [ ] **RF05 - Diferenciação de Perfis:** O sistema deve diferenciar os tipos de usuários da plataforma, aplicando as devidas permissões para:
    
    - [ ] **Usuário Comum:** Pessoas da comunidade que buscam ou relatam animais.
        
    - [ ] **Perfil Institucional (ONG / Protetor):** Instituições e protetores independentes com funcionalidades estendidas.
        
    - [ ] **Administrador:** Gestores do sistema.
        

## 2. Módulo de Animais e Publicações

- [ ] **RF06 - Cadastro de Animais:** O sistema deve permitir o cadastro de ocorrências de animais categorizados como:
    
    - [ ] _Perdidos_
        
    - [ ] _Encontrados_
        
    - [ ] _Para Adoção_
        
- [ ] **RF07 - Consulta e Busca de Animais:** O sistema deve permitir a consulta e listagem de animais perdidos, encontrados e disponíveis para adoção.
    
- [ ] **RF08 - Filtros de Pesquisa:** O sistema deve disponibilizar filtros práticos para facilitar a localização de animais (ex: por situação, espécie, porte ou localização).
    
- [ ] **RF09 - Atualização de Situação do Animal:** O criador do registro ou um administrador deve poder atualizar o status da publicação (ex: alterar para "Encontrado/Devolvido ao Dono" ou "Adotado").
    
- [ ] **RF10 - Contato com Responsáveis:** O sistema deve permitir que interessados ou pessoas que visualizaram o animal entrem em contato direto com os responsáveis pela publicação.
    
- [ ] **RF11 - Consulta de Informações de Adoção:** O sistema deve permitir que interessados em adotar consultem informações detalhadas sobre a saúde, temperamento e história do animal.
    

## 3. Módulo Institucional (ONGs e Protetores Independentes)

- [ ] **RF12 - Gestão de Múltiplos Animais:** O perfil institucional deve permitir cadastrar, gerenciar e atualizar múltiplos animais sob custódia da ONG ou protetor.
    
- [ ] **RF13 - Divulgação de Campanhas e Ações:** O perfil institucional deve permitir a publicação e divulgação de campanhas de arrecadação, feiras de adoção e ações comunitárias.
    

## 4. Módulo de Denúncias

- [ ] **RF14 - Registro e Acompanhamento de Denúncias:** O sistema deve permitir o registro seguro de denúncias de maus-tratos ou abandono com foto, localização e descrição, permitindo ao denunciante ou admin acompanhar o andamento da ocorrência.
    

## 5. Módulo Administrativo (Restrito)

- [ ] **RF15 - Painel Restrito do Administrador:** O sistema deve disponibilizar uma área administrativa restrita acessível apenas por perfis com permissão de administrador.
    
- [ ] **RF16 - Gerenciamento de Usuários:** O administrador poderá visualizar, editar, suspender ou excluir contas de usuários do sistema.
    
- [ ] **RF17 - Gerenciamento de Conteúdo/Animais:** O administrador poderá moderar, editar ou remover publicações de animais que violem os termos de uso.
    
- [ ] **RF18 - Aprovação de Cadastros Institucionais:** O administrador poderá analisar, aprovar ou reprovar a criação de contas institucionais (ONGs/Protetores).
    
- [ ] **RF19 - Consulta de Informações Gerais do Sistema:** O administrador poderá visualizar relatórios e estatísticas gerais da plataforma (ex: total de cadastros, animais resgatados, denúncias registradas).
    