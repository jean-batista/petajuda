-- Adiciona a data de nascimento e os atributos embutidos de endereço na tabela_usuario
ALTER TABLE tabela_usuario
    ADD COLUMN nascimento DATE NOT NULL,
    ADD COLUMN estado VARCHAR(50) NOT NULL,
    ADD COLUMN cidade VARCHAR(150) NOT NULL,
    ADD COLUMN bairro VARCHAR(150) NOT NULL,
    ADD COLUMN rua VARCHAR(150) NOT NULL,
    ADD COLUMN complemento VARCHAR(150);