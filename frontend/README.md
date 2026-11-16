# Pet Ajuda · Frontend

React + Vite + Tailwind CSS + Lucide + React Router.

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Modo demonstração x API

O site funciona de dois jeitos:

| Modo | Quando | Dados |
|---|---|---|
| **Demonstração** | sem o arquivo `.env.local` | dados de exemplo salvos no navegador (`src/data`) |
| **API** | com `VITE_API_URL` no `.env.local` | backend Spring Boot (`/api/v1/...`) |

Para usar a API:

1. Copie `.env.example` para `.env.local` (o endereço padrão é `http://localhost:8080`).
2. No backend, a variável `ALLOWED_ORIGINS` precisa incluir `http://localhost:5173` (CORS).
3. Reinicie o `npm run dev`.

No modo demonstração, a janela de login mostra atalhos para as contas Usuário, ONG e Admin (senha `123456`).

## Estrutura

```
src/
  pages/        as 4 telas (Feed, Detalhes, ONGs, Central de Ações)
  components/   peças reaproveitáveis (cards, modais, formulários)
  context/      sessão do usuário (AuthContext)
  services/     funções que as telas chamam; escolhem entre API e demonstração
    http.js     cliente da API (token JWT, multipart, mensagens de erro)
    api/        chamadas aos endpoints e conversão das respostas
  data/         enums e dados de demonstração
```

## Diferenças conhecidas em relação ao backend

- O backend ainda não tem **aprovação de ONGs**: no modo API toda ONG cadastrada já aparece no site.
- Ao cadastrar uma ONG, o backend mantém o perfil `USUARIO_COMUM`; o front trata como ONG quem tem uma ONG vinculada.
- Não há endpoint de **recuperação de senha** nem de **consulta de denúncia por protocolo** para quem não é admin.
- O feed (`GET /publicacoes`) ainda não aceita filtros; o filtro é feito no front.
