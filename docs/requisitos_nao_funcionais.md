# 🛠️ Especificação de Requisitos Não Funcionais (RNF)

**Projeto:** Pet Ajuda AMUREL — Plataforma de Apoio e Proteção Animal

**Escopo:** Requisitos de Qualidade, Desempenho, Arquitetura e Segurança

## 1. Requisitos de Usabilidade e Compatibilidade

- [ ] **RNF01 - Interface Simples, Intuitiva e Responsiva (Mobile-First):**
    
    - [ ] A aplicação deve possuir uma interface gráfica limpa, focada na facilidade de navegação por pessoas de diferentes idades.
        
    - [ ] O layout deve ser totalmente responsivo, adaptando-se automaticamente a telas de smartphones, tablets e desktops (Mobile-First).
        
- [ ] **RNF02 - Compatibilidade Multiplataforma:**
    
    - [ ] A sistema web deve ser totalmente funcional nos principais navegadores modernos do mercado (Google Chrome, Mozilla Firefox, Apple Safari e Microsoft Edge).
        

## 2. Requisitos de Desempenho e Confiabilidade

- [ ] **RNF03 - Desempenho e Tempo de Resposta:**
    
    - [ ] O tempo de resposta para o carregamento do feed e consultas simples no banco de dados não deve exceder **2 segundos** sob conexão de internet estável.
        
    - [ ] O sistema deve ser projetado para suportar requisições concorrentes (múltiplos usuários acessando e criando publicações ao mesmo tempo) sem degradação do serviço.
        
- [ ] **RNF04 - Disponibilidade e Mecanismos de Backup:**
    
    - [ ] O sistema deve buscar uma taxa de disponibilidade de **99% (Uptime)** durante o período de uso.
        
    - [ ] O banco de dados deve possuir rotina automatizada de _backup_ (diário ou semanal) para evitar perda de dados em caso de falha física ou de servidor.
        

## 3. Requisitos de Segurança e Privacidade

- [ ] **RNF05 - Segurança e Proteção de Dados:**
    
    - [ ] As senhas de acesso dos usuários **nunca** devem ser salvas em texto limpo, devendo ser criptografadas utilizando algoritmos de hash seguros (ex: BCrypt ou Argon2).
        
    - [ ] A navegação e a troca de dados entre a aplicação cliente e o servidor devem ocorrer sob protocolo seguro **HTTPS** (criptografia SSL/TLS).
        
    - [ ] As sessões de usuários autenticados devem ser gerenciadas via tokens seguros (JWT).
        
- [ ] **RNF06 - Conformidade com a LGPD (Lei Geral de Proteção de Dados):**
    
    - [ ] O sistema deve coletar apenas os dados estritamente necessários para o funcionamento das publicações e contatos (princípio da minimização).
        
    - [ ] O usuário deve ter acesso fácil aos Termos de Uso e Política de Privacidade no momento do cadastro.
        
    - [ ] Dados sensíveis (como telefone pessoal de quem encontrou o animal) só devem ser exibidos com autorização expressa do criador da publicação.