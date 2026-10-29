
# ☕ Mapeamento da Arquitetura Backend (Spring Boot)

**Projeto:** Pet Ajuda — Plataforma de Apoio e Proteção Animal

**Linguagem:** Java 17+ | **Framework:** Spring Boot 3.x | **Padrão:** RESTful API (Camadas MVC/DDD)

## 📁 Árvore do Projeto (Diretórios e Arquivos)

```
src/main/java/com/petajuda/amurel/
├── 📄 PetAjudaApplication.java                   --> Classe Principal (Spring Boot Loader)
│
├── 📁 config/                                    --> Configurações Globais da Aplicação
│   ├── 📄 SecurityConfig.java                    --> Configuração do Spring Security e CORS
│   ├── 📄 CorsConfig.java                        --> Liberação de acessos do Frontend (React)
│   ├── 📄 SwaggerConfig.java                     --> Documentação automática das APIs (OpenAPI)
│   └── 📄 InitializerData.java                   --> Carga inicial de dados para testes (Admin/Mock)
│
├── 📁 enums/                                     --> Constantes e Tipos Enumerados
│   ├── 📄 PerfilUsuario.java                     --> [USUARIO_COMUM, ONG, ADMIN]
│   ├── 📄 EspecieAnimal.java                     --> [CAO, GATO, OUTRO]
│   ├── 📄 PorteAnimal.java                       --> [PEQUENO, MEDIO, GRANDE]
│   ├── 📄 TipoPublicacao.java                    --> [PERDIDO, ENCONTRADO, ADOCAO]
│   ├── 📄 StatusPublicacao.java                  --> [ATIVO, RESOLVIDO]
│   └── 📄 StatusDenuncia.java                    --> [PENDENTE, EM_ANALISE, CONCLUIDA, REJEITADA]
│
├── 📁 domain/ (ou model/)                        --> Mapeamento Relacional / Entidades JPA
│   ├── 📄 Usuario.java                           --> Entidade de Usuários e Autenticação
│   ├── 📄 Ong.java                               --> Dados estendidos para Perfis Institucionais
│   ├── 📄 Animal.java                            --> Atributos do Pet (Nome, espécie, fotos, etc)
│   ├── 📄 Publicacao.java                        --> Post com localização, tipo e status
│   ├── 📄 Denuncia.java                          --> Ocorrências de maus-tratos/abandono
│   └── 📄 Campanha.java                          --> Feiras, vaquinhas e mutirões de ONGs
│
├── 📁 dtos/                                      --> Data Transfer Objects (Entrada/Saída da API)
│   ├── 📁 auth/
│   │   ├── 📄 LoginRequestDTO.java
│   │   ├── 📄 LoginResponseDTO.java
│   │   └── 📄 RegisterUsuarioDTO.java
│   ├── 📁 publicacao/
│   │   ├── 📄 PublicacaoRequestDTO.java
│   │   ├── 📄 PublicacaoResponseDTO.java
│   │   └── 📄 PublicacaoFilterDTO.java
│   ├── 📁 ong/
│   │   ├── 📄 OngCadastroDTO.java
│   │   └── 📄 OngResponseDTO.java
│   └── 📁 denuncia/
│       ├── 📄 DenunciaRequestDTO.java
│       └── 📄 DenunciaResponseDTO.java
│
├── 📁 repositories/                              --> Interfaces de Comunicação com Banco de Dados (Spring Data JPA)
│   ├── 📄 UsuarioRepository.java
│   ├── 📄 OngRepository.java
│   ├── 📄 AnimalRepository.java
│   ├── 📄 PublicacaoRepository.java
│   ├── 📄 DenunciaRepository.java
│   └── 📄 CampanhaRepository.java
│
├── 📁 services/                                  --> Regras de Negócio e Serviços da Aplicação
│   ├── 📄 AutenticacaoService.java               --> Lógica de Login e Criptografia de Senhas
│   ├── 📄 TokenService.java                      --> Geração e Validação de Tokens JWT
│   ├── 📄 UsuarioService.java                    --> Gestão de perfis e atualizações
│   ├── 📄 OngService.java                        --> Validação e aprovação de perfis institucionais
│   ├── 📄 PublicacaoService.java                 --> CRUD de posts e filtros do Feed
│   ├── 📄 MatchService.java                      --> Algoritmo de cruzamento (Perdido x Encontrado)
│   ├── 📄 DenunciaService.java                   --> Registro e triagem administrativa
│   └── 📄 CampanhaService.java                   --> Divulgação de ações de ONGs
│
├── 📁 controllers/                               --> Endpoints REST (Interfaces Web/API)
│   ├── 📄 AuthController.java                    --> [/api/v1/auth]
│   ├── 📄 UsuarioController.java                 --> [/api/v1/usuarios]
│   ├── 📄 OngController.java                     --> [/api/v1/ongs]
│   ├── 📄 PublicacaoController.java              --> [/api/v1/publicacoes]
│   ├── 📄 DenunciaController.java                --> [/api/v1/denuncias]
│   ├── 📄 CampanhaController.java                --> [/api/v1/campanhas]
│   └── 📄 AdminController.java                   --> [/api/v1/admin]
│
├── 📁 security/                                  --> Filtros e Interceptadores de Segurança
│   ├── 📄 SecurityFilter.java                    --> Interceptador do Token JWT a cada requisição
│   └── 📄 CustomUserDetailsService.java          --> Integração do Spring Security com UsuarioRepository
│
└── 📁 exceptions/                                --> Tratamento de Erros Personalizados
    ├── 📄 ResourceNotFoundException.java        --> Erro 404 (Entidade não encontrada)
    ├── 📄 BusinessException.java                --> Erro 400 (Regra de negócio violada)
    └── 📄 GlobalExceptionHandler.java           --> `@RestControllerAdvice` para padronização de respostas de erro
```

## 🧱 Detalhamento do Papel de Cada Camada

### 1. 🌐 `controllers` (A Porta de Entrada)

- **O que faz:** Recebe as requisições HTTP enviadas pelo frontend em React, valida os dados recebidos via DTO e delega o processamento para a camada de `services`.
    
- **Anotações Spring principais:** `@RestController`, `@RequestMapping`, `@PostMapping`, `@GetMapping`, `@PutMapping`, `@DeleteMapping`.
    

### 2. ⚙️ `services` (O Cérebro do Sistema)

- **O que faz:** Contém todas as **Regras de Negócio**. É onde a mágica acontece (ex: conferir se a senha está correta, disparar o algoritmo de sugestão de _Match_, alterar o status do post para "RESOLVIDO").
    
- **Anotações Spring principais:** `@Service`, `@Transactional`.
    

### 3. 🗄️ `repositories` (A Ponte com o Banco de Dados)

- **O que faz:** Interface que estende `JpaRepository<Entidade, ID>`. O Spring Boot gera automaticamente os comandos SQL para buscar, salvar, atualizar e deletar registros no PostgreSQL.
    
- **Anotações Spring principais:** `@Repository`.
    

### 4. 🔀 `dtos` (Segurança e Desempenho no Tráfego)

- **O que faz:** Filtra os dados que entram e saem da API. Evita que informações sensíveis (como a senha criptografada do usuário) sejam expostas para o frontend.
    

### 5. 🛡️ `security` & `config` (A Proteção da Aplicação)

- **O que faz:** Bloqueia o acesso a rotas restritas (ex: impede que um usuário comum acesse endpoints `/api/v1/admin` ou envie denúncias em nome de outro).