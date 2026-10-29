# 👥 Definição dos Atores da Aplicação
**Projeto:** Pet Ajuda — Plataforma de Apoio e Proteção Animal  
**Escopo:** Mapeamento de Papéis, Responsabilidades e Hierarquia de Acesso  

---

## 📋 Resumo dos Atores

Os atores representam qualquer entidade externa (usuário humano ou perfil especializado) que interage com o sistema. No **Pet Ajuda **, identificamos **4 atores principais**:

```
                  +--------------------------------+
                  |           VISITANTE            |
                  |  (Usuário Não Autenticado)     |
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |         USUÁRIO COMUM          |
                  |     (Cidadão Autenticado)      |
                  +--------------------------------+
                                  |
               +------------------+------------------+
               |                                     |
               v                                     v
+-----------------------------+       +-----------------------------+
|      ONG / PROTETOR         |       |        ADMINISTRADOR        |
|   (Perfil Institucional)    |       |      (Gestão do Sistema)    |
+-----------------------------+       +-----------------------------+
```

---

## 🛠️ Detalhamento dos Atores

### 1. 🌐 Visitante (Usuário Não Autenticado)
* **Descrição:** Qualquer pessoa da comunidade ou visitante casual que acessa a plataforma sem realizar login.
* **Objetivo:** Consultar informações rápidas sobre animais perdidos, encontrados ou disponíveis para adoção na região em que o usuário se encontra.
* **Principais Ações e Permissões:**
  * Visualizar o feed de publicações de animais.
  * Utilizar os filtros de pesquisa (espécie, situação, porte).
  * Visualizar o mapa interativo com as marcações regionais.
  * Consultar detalhes da publicação e formas de contato públicas.
  * Visualizar a lista e perfis públicos de ONGs/Protetores cadastrados.

---

### 2. 👤 Usuário Comum (Cidadão Autenticado)
* **Descrição:** Cidadão morador da região da  devidamente cadastrado na plataforma.
* **Objetivo:** Cadastrar animais perdidos ou encontrados, doar pets, contatar responsáveis e reportar irregularidades.
* **Principais Ações e Permissões:**
  * *Herda todas as permissões do Visitante.*
  * Realizar cadastro, login, logout e recuperação de senha.
  * Criar novas publicações de animais (*Perdido*, *Encontrado*, *Para Adoção*).
  * Gerenciar suas próprias publicações (editar dados, fotos ou alterar o status para "Resolvido").
  * Registrar denúncias de maus-tratos ou abandono de animais.
  * Entrar em contato direto com os criadores de outras publicações.
  * Editar e atualizar seus dados do perfil de usuário.

---

### 3. 🐾 ONG / Protetor Independent (Perfil Institucional)
* **Descrição:** Entidades sem fins lucrativos, abrigos ou protetores de animais independentes que atuam na região da  e possuem cadastro validado.
* **Objetivo:** Divulgar animais sob sua custódia para adoção responsável, arrecadar doações e promover eventos/campanhas comunitárias.
* **Principais Ações e Permissões:**
  * *Herda todas as permissões do Usuário Comum.*
  * Gerenciar um número ilimitado de cadastros de animais simultâneos sob sua guarda.
  * Publicar e gerenciar campanhas institucionais (feiras de adoção, mutirões de castração, vaquinhas/Pix).
  * Personalizar a página de perfil institucional (história, endereço, Pix de doação, redes sociais).
  * Receber solicitações e contatos de interessados em adoção.

---

### 4. 🛡️ Administrador (Gestor do Sistema)
* **Descrição:** Membro da equipe responsável pela manutenção, segurança e moderação do conteúdo da plataforma Pet Ajuda.
* **Objetivo:** Garantir a qualidade das informações, a segurança dos usuários e o bom funcionamento da aplicação.
* **Principais Ações e Permissões:**
  * Acessar o Painel Administrativo Restrito.
  * Analisar, aprovar ou reprovar solicitações de cadastro de contas institucionais (ONGs/Protetores).
  * Moderar, editar ou remover publicações que violem os termos de uso da plataforma.
  * Gerenciar contas de usuários (advertir, suspender ou excluir).
  * Acompanhar o histórico de denúncias registradas para triagem/encaminhamento.
  * Visualizar relatórios gerais, estatísticas e indicadores do sistema (ex: total de resgates e adoções na ).

---

## 📊 Matriz de Permissões (CRUD de Funcionalidades)

| Funcionalidade                            | Visitante | Usuário Comum | ONG / Protetor | Administrador |
| :---------------------------------------- | :-------: | :-----------: | :------------: | :-----------: |
| **Visualizar Feed / Mapa**                |           |               |                |               |
| **Criar Publicação de Animal**            |     ❌     |               |                |               |
| **Editar/Excluir Própria Publicação**     |     ❌     |               |                |               |
| **Registrar Denúncia**                    |     ❌     |               |                |               |
| **Divulgar Campanhas / Feiras**           |     ❌     |       ❌       |                |               |
| **Gerenciar Múltiplos Animais**           |     ❌     |       ❌       |                |               |
| **Aprovar Cadastros de ONGs**             |     ❌     |       ❌       |       ❌        |               |
| **Moderar/Excluir Conteúdo de Terceiros** |     ❌     |       ❌       |       ❌        |               |
| **Acessar Painel de Relatórios**          |     ❌     |       ❌       |       ❌        |               |