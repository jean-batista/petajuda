
# 🌐 Documentação de Endpoints REST API — Pet Ajuda AMUREL

> 
> **Base URL:** `http://localhost:8080/api/v1`
> 
> **Formato de Troca:** `application/json`
> 
> **Autenticação:** Header `Authorization: Bearer <TOKEN_JWT>`

## 🔑 1. Autenticação e Registro (`/api/auth`)

> [!KEY] Resumo do Módulo Gerencia o ciclo de entrada na aplicação: criação de contas de usuários comuns, cadastro de ONGs e autenticação via JWT.

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`POST`|`/api/auth/login`|Público|Autentica o usuário e retorna o Token JWT com suas permissões.|
|`POST`|`/api/auth/register`|Público|Cadastro de nova conta para **Usuário Comum**.|
|`POST`|`/api/auth/register-ong`|Público|Cadastro simultâneo de **Usuário + Perfil ONG**.|

### 📥 Payloads de Exemplo

#### Login (`POST /api/auth/login`)

```
{
  "email": "joao@email.com",
  "senha": "senhaSegura123"
}
```

#### Resposta de Sucesso do Login (`200 OK`)

```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipoToken": "Bearer",
  "perfil": "USUARIO_COMUM",
  "nome": "João Silva"
}
```

#### Registro de ONG (`POST /api/auth/register-ong`)

```
{
  "nome": "Maria Responsável",
  "sobrenome": "Santos",
  "email": "contato@patasdaamurel.org",
  "telefone": "48999998888",
  "senha": "senhaSegura123",
  "razaoSocial": "Associação Patas da AMUREL",
  "cnpj": "12345678000199",
  "chavePix": "contato@patasdaamurel.org",
  "descricao": "ONG focada na resgate e castração de animais de rua em Tubarão.",
  "endereco": {
    "estado": "SC",
    "cidade": "Tubarão",
    "bairro": "Centro",
    "rua": "Rua Altamiro Guimarães",
    "complemento": "Sala 102"
  }
}
```

## 👤 2. Gestão de Usuários (`/api/usuarios`)

> [!INFO] Regra de Acesso Os endpoints iniciados com `/me` atuam sobre a conta do usuário logado identificada através do Token JWT.

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`GET`|`/api/usuarios/me`|Autenticado|Retorna os dados do perfil logado no momento.|
|`PUT`|`/api/usuarios/me`|Autenticado|Atualiza informações cadastrais básicas.|
|`PATCH`|`/api/usuarios/me/senha`|Autenticado|Altera a senha do usuário logado.|
|`GET`|`/api/usuarios`|`ADMIN`|Lista geral de usuários com paginação e filtro.|
|`PATCH`|`/api/usuarios/{id}/status`|`ADMIN`|Ativa ou inativa o acesso de uma conta.|

## 🏛️ 3. Perfil de ONGs (`/api/ongs`)

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`GET`|`/api/ongs`|Público|Lista todas as ONGs ativas e aprovadas na plataforma.|
|`GET`|`/api/ongs/{id}`|Público|Detalhes públicos da ONG (Chave Pix, contato, endereço).|
|`PUT`|`/api/ongs/me`|`ONG`|Atualiza os dados institucionais da própria ONG.|
|`GET`|`/api/ongs/{id}/animais`|Público|Lista os animais cadastrados sob a custódia da ONG.|

## 🐾 4. Gestão de Animais (`/api/animais`)

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`POST`|`/api/animais`|Autenticado|Registra a ficha de um animal no sistema.|
|`GET`|`/api/animais/{id}`|Público|Consulta dados de um animal específico por UUID.|
|`PUT`|`/api/animais/{id}`|Autor / `ADMIN`|Atualiza dados da ficha do animal.|
|`DELETE`|`/api/animais/{id}`|Autor / `ADMIN`|Remove a ficha do animal do banco de dados.|

### 📥 Payload de Exemplo (`POST /api/animais`)

```
{
  "nome": "Thor",
  "sexo": "MACHO",
  "corPredominante": "Caramelo",
  "castrado": true,
  "vacinado": true,
  "descricao": "Cão dócil, possui uma mancha preta no peito e coleira vermelha.",
  "fotoUrl": "https://storage.petajuda.com/animais/thor.jpg",
  "idadeAnimal": "ADULTO",
  "porteAnimal": "MEDIO",
  "especieAnimal": "CACHORRO"
}
```

## 📢 5. Feed de Publicações (`/api/publicacoes`)

> [!SUCCESS] Módulo Principal (Core) Concentra os posts de animais perdidos, encontrados e colocados para adoção na região da AMUREL.

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`POST`|`/api/publicacoes`|Autenticado|Cria publicação no feed vinculando a um `Animal` pré-cadastrado.|
|`GET`|`/api/publicacoes`|Público|Feed geral de publicações com filtros combinados.|
|`GET`|`/api/publicacoes/{id}`|Público|Exibe detalhes da publicação e dados de contato do autor.|
|`PATCH`|`/api/publicacoes/{id}/status`|Autor / `ADMIN`|Altera status (`ATIVO` -> `RESOLVIDO`).|
|`DELETE`|`/api/publicacoes/{id}`|Autor / `ADMIN`|Exclui a publicação.|

### 🔍 Query Parameters do Feed (`GET /api/publicacoes`)

- `tipoPublicacao`: `PERDIDO` | `ENCONTRADO` | `ADOCAO`
    
- `especie`: `CACHORRO` | `GATO` | `PASSARO`
    
- `porte`: `PEQUENO` | `MEDIO` | `GRANDE`
    
- `cidade`: Nome da cidade (ex: `Tubarão`)
    
- `bairro`: Nome do bairro (ex: `Oficinas`)
    
- `status`: `ATIVO` | `RESOLVIDO`
    

### 📥 Payload de Criação (`POST /api/publicacoes`)

```
{
  "titulo": "Cão caramelo perdido próximo ao Farol Shopping",
  "descricao": "Fugiu do pátio durante a tempestade de ontem à noite. Atende pelo nome de Thor.",
  "tipoPublicacao": "PERDIDO",
  "animalId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "endereco": {
    "estado": "SC",
    "cidade": "Tubarão",
    "bairro": "Vila Moema",
    "rua": "Rua Lauro Müller",
    "complemento": "Próximo à praça"
  }
}
```

## 🚨 6. Central de Denúncias (`/api/denuncias`)

> [!WARNING] Canal Sigiloso As denúncias são **totalmente anônimas** e os endpoints de leitura e atualização de status são restritos **exclusivamente aos Administradores**.

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`POST`|`/api/denuncias`|Público (Anônimo)|Registra relato anônimo de maus-tratos/abandono.|
|`GET`|`/api/denuncias`|`ADMIN`|Painel privado para triagem de ocorrências.|
|`GET`|`/api/denuncias/{id}`|`ADMIN`|Exibe detalhes internos de uma denúncia.|
|`PATCH`|`/api/denuncias/{id}/status`|`ADMIN`|Atualiza o status da investigação.|

### 📥 Payload de Envio (`POST /api/denuncias`)

```
{
  "descricao": "Animal mantido sem água e sob sol forte nos fundos de um imóvel abandonado.",
  "fotoUrl": "https://storage.petajuda.com/denuncias/evidencia_102.jpg",
  "endereco": {
    "estado": "SC",
    "cidade": "Tubarão",
    "bairro": "Humaitá",
    "rua": "Rua Engenheiro Annes Gualberto",
    "complemento": "Casa azul sem muro"
  }
}
```

## 🎯 7. Ações e Campanhas de ONGs (`/api/campanhas`)

|   |   |   |   |
|---|---|---|---|
|**Método**|**Endpoint**|**Acesso**|**Descrição**|
|`POST`|`/api/campanhas`|`ONG`|Cadastra uma nova ação ou vaquinha.|
|`GET`|`/api/campanhas`|Público|Lista campanhas ativas para divulgação.|
|`GET`|`/api/campanhas/{id}`|Público|Detalhes de uma campanha específica.|
|`PUT`|`/api/campanhas/{id}`|Autor (ONG) / `ADMIN`|Atualiza dados da campanha.|
|`PATCH`|`/api/campanhas/{id}/status`|Autor (ONG) / `ADMIN`|Ativa ou desativa a campanha.|

## ⚠️ 8. Padronização de Respostas de Erro

Para garantir o tratamento uniforme de exceções no frontend (React), todos os erros lançados pelo `GlobalExceptionHandler` do Spring Boot retornarão a seguinte estrutura JSON:

```
{
  "timestamp": "2026-10-29T11:45:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Campos inválidos na requisição",
  "path": "/api/publicacoes",
  "errors": [
    {
      "campo": "titulo",
      "mensagem": "O título é obrigatório"
    },
    {
      "campo": "animalId",
      "mensagem": "O ID do animal não pode ser nulo"
    }
  ]
}
```