# 🐶 Pet Ajuda — Plataforma de Apoio e Proteção Animal

## 🎯 Sobre o Projeto

O **Pet Ajuda** é uma plataforma web desenvolvida para resolver a dispersão de informações sobre animais perdidos, encontrados e disponíveis para adoção. Atualmente, tutores e protetores dependem de grupos pulverizados no WhatsApp e Facebook, onde postagens são rapidamente soterradas e denúncias de maus-tratos frequentemente não chegam aos órgãos competentes.

A plataforma utiliza a **localização do usuário (geolocalização/cidade atual)** para centralizar o ecossistema de proteção animal de forma dinâmica, conectando rapidamente **cidadãos, protetores independentes, ONGs e administradores locais**.

---

## 🚀 Funcionalidades Principais

* **📍 Feed Dinâmico por Localização:**
  * Identificação automática da cidade/estado do usuário via geolocalização ou busca manual.
  * Exibição priorizada de publicações de animais na mesma cidade/região do usuário.

* **📢 Feed de Publicações (Perdidos, Encontrados e Adoção):**
  * Cadastro detalhado de pets com características, fotos e localização (cidade, bairro e ponto de referência).
  * Filtros dinâmicos por tipo de ocorrência, espécie, porte e raio de localização.
  * Contato direto via WhatsApp com o responsável pelo registro.

* **🏛️ Espaço Institucional para ONGs e Protetores:**
  * Perfis institucionais organizados por cidade/região.
  * Box de doação rápida via chave Pix (QR Code).
  * Divulgação de campanhas, vaquinhas e feiras de adoção locais.

* **🚨 Central de Denúncias Sigilosas:**
  * Canal seguro para registro anônimo de relatos de maus-tratos ou abandono com fotos e localização.
  * Painel restrito para triagem, moderação e atualização do status da ocorrência por Administradores.

* **🛡️ Painel Administrativo:**
  * Aprovação e moderação de perfis institucionais de ONGs.
  * Gestão de usuários, denúncias e moderação de conteúdos que violem os termos de uso.

---

## 🛠️ Stack Tecnológica

### Backend (API RESTful)
* **Linguagem:** Java 17+
* **Framework:** Spring Boot 3.x
* **Segurança & Autenticação:** Spring Security + JWT (JSON Web Tokens) + BCrypt
* **Persistência de Dados:** Spring Data JPA / Hibernate
* **Banco de Dados:** PostgreSQL
* **Documentação de API:** OpenAPI / Swagger UI
* **Utilitários:** Lombok, Bean Validation

### Frontend (Single Page Application)
* **Biblioteca Principal:** React 18+
* **Ferramenta de Build:** Vite
* **Estilização:** Tailwind CSS
* **Ícones:** Lucide React
* **Navegação:** React Router DOM

---

## 📁 Estrutura de Documentação do Projeto (`/docs`)

Toda a especificação técnica de engenharia de software está organizada dentro da pasta `docs/`:

```
docs/
├── requisitos_funcionais.md         --> Especificação dos Requisitos Funcionais (RF)
├── requisitos_nao_funcionais.md     --> Requisitos de Qualidade, Desempenho e Segurança (RNF)
├── atores_da_aplicacao.md           --> Mapeamento de Perfis, Permissões e Matriz CRUD
├── estrutura_backend_spring_boot.md --> Arquitetura de Pacotes e Camadas Java
├── endpoints_api_rest.md            --> Documentação de Rotas, Verbos HTTP e Payloads JSON
├── diagramas_uml.md                 --> Diagrama de Classes e Diagrama de Casos de Uso (Mermaid)
└── telas_do_sistema.md              --> Mapeamento Visual e Funcional das Telas da Aplicação
```

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
* **JDK 17+** instalado.
* **Node.js 18+** e **npm** (ou yarn/pnpm) instalados.
* **PostgreSQL** instalado e em execução (ou instância Docker).
* IDE recomendada: IntelliJ IDEA, VS Code ou Eclipse.

---

### 1. Configurando o Backend (Spring Boot)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/petajuda.git
   cd petajuda/backend
   ```

2. Crie o banco de dados no PostgreSQL:
   ```sql
   CREATE DATABASE petajuda;
   ```

3. Configure as credenciais no arquivo `src/main/resources/application.yml`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/petajuda
   spring.datasource.username=seu_usuario
   spring.datasource.password=sua_senha
   spring.jpa.hibernate.ddl-auto=update
   
   api.security.token.secret=sua_chave_secreta_jwt
   ```

4. Execute a aplicação Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   A API estará rodando em: `http://localhost:8080/api`

---

### 2. Configurando o Frontend (React)

1. Navegue até a pasta do frontend:
   ```bash
   cd ../frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do frontend com a URL da API:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em: `http://localhost:5173`

---

## 🔗 Endpoints da API (Resumo)

| Módulo | Rota Base | Método Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **Autenticação** | `/api/auth` | `POST /login` | Autenticação e emissão de Token JWT |
| **Usuários** | `/api/usuarios` | `GET /me` | Perfil do usuário logado |
| **ONGs** | `/api/ongs` | `GET /` | Diretório público de ONGs (filtrado por cidade) |
| **Animais** | `/api/animais` | `POST /` | Cadastro de ficha de pet |
| **Publicações** | `/api/publicacoes` | `GET /` | Feed com filtros por localização do usuário |
| **Denúncias** | `/api/denuncias` | `POST /` | Envio de relato anônimo de maus-tratos |
| **Campanhas** | `/api/campanhas` | `GET /` | Vaquinhas e feiras institucionais |

*Consulte a especificação completa em [`docs/endpoints_api_rest.md`](docs/endpoints_api_rest.md).*
