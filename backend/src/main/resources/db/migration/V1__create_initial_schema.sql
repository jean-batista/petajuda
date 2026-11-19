CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela: Usuario
CREATE TABLE tabela_usuario (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
nome VARCHAR(100) NOT NULL,
sobrenome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
telefone VARCHAR(50) NOT NULL UNIQUE,
senha VARCHAR(150) NOT NULL,
ativo BOOLEAN NOT NULL DEFAULT TRUE,
data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
perfil_usuario VARCHAR(50) NOT NULL
);

-- 2. Tabela: Ong
CREATE TABLE tabela_ong (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
nome VARCHAR(100) NOT NULL,
razao_social VARCHAR(100) NOT NULL,
cnpj VARCHAR(100) NOT NULL UNIQUE,
chave_pix VARCHAR(100),
descricao TEXT NOT NULL,
-- Atributos embutidos da classe @Embeddable Endereco
estado VARCHAR(100) NOT NULL,
cidade VARCHAR(100) NOT NULL,
bairro VARCHAR(100) NOT NULL,
rua VARCHAR(100) NOT NULL,
complemento VARCHAR(255) NOT NULL
);

-- 3. Tabela: Animal
CREATE TABLE tabela_animal (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
nome VARCHAR(100) NOT NULL,
sexo VARCHAR(10) NOT NULL,
cor_predominante VARCHAR(50) NOT NULL,
castrado BOOLEAN NOT NULL,
vacinado BOOLEAN NOT NULL,
descricao TEXT NOT NULL,
foto_url TEXT NOT NULL,
idade VARCHAR(50) NOT NULL,
porte VARCHAR(50) NOT NULL,
especie VARCHAR(50) NOT NULL,
usuario_id UUID NOT NULL,
CONSTRAINT fk_animal_usuario FOREIGN KEY (usuario_id) REFERENCES tabela_usuario(id) ON DELETE CASCADE
);

-- 4. Tabela: Publicacao
CREATE TABLE tabela_publicacao (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
titulo VARCHAR(50) NOT NULL,
descricao TEXT NOT NULL,
data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
status VARCHAR(50) NOT NULL,
tipo VARCHAR(50) NOT NULL,
usuario_id UUID NOT NULL,
animal_id UUID NOT NULL,
-- Atributos embutidos da classe @Embeddable Endereco
estado VARCHAR(100) NOT NULL,
cidade VARCHAR(100) NOT NULL,
bairro VARCHAR(100) NOT NULL,
rua VARCHAR(100) NOT NULL,
complemento VARCHAR(255) NOT NULL,
CONSTRAINT fk_publicacao_usuario FOREIGN KEY (usuario_id) REFERENCES tabela_usuario(id) ON DELETE CASCADE,
CONSTRAINT fk_publicacao_animal FOREIGN KEY (animal_id) REFERENCES tabela_animal(id) ON DELETE CASCADE
);

-- 5. Tabela: Denuncia
CREATE TABLE tabela_denuncia (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
titulo VARCHAR(100) NOT NULL,
descricao TEXT NOT NULL,
foto_url TEXT NOT NULL,
data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
status VARCHAR(50) NOT NULL,
-- Atributos embutidos da classe @Embeddable Endereco
estado VARCHAR(100) NOT NULL,
cidade VARCHAR(100) NOT NULL,
bairro VARCHAR(100) NOT NULL,
rua VARCHAR(100) NOT NULL,
complemento VARCHAR(255) NOT NULL
);

-- 6. Tabela: Campanha
CREATE TABLE tabela_campanha (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
titulo VARCHAR(100) NOT NULL,
descricao TEXT NOT NULL,
inicio TIMESTAMP NOT NULL,
fim TIMESTAMP NOT NULL,
ativo BOOLEAN NOT NULL DEFAULT TRUE,
ong_id UUID NOT NULL,
CONSTRAINT fk_campanha_ong FOREIGN KEY (ong_id) REFERENCES tabela_ong(id) ON DELETE CASCADE
);

-- Indexes para alta performance em buscas frequentes no feed e filtros por localização
CREATE INDEX idx_usuario_email ON tabela_usuario(email);
CREATE INDEX idx_animal_usuario ON tabela_animal(usuario_id);
CREATE INDEX idx_publicacao_cidade_bairro ON tabela_publicacao(cidade, bairro);
CREATE INDEX idx_publicacao_tipo_status ON tabela_publicacao(tipo, status);
CREATE INDEX idx_campanha_ong ON tabela_campanha(ong_id);