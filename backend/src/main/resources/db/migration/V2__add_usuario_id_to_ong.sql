ALTER TABLE tabela_ong
    ADD COLUMN usuario_id UUID NOT NULL UNIQUE,
    ADD CONSTRAINT fk_ong_usuario FOREIGN KEY (usuario_id) REFERENCES tabela_usuario(id) ON DELETE CASCADE;

CREATE INDEX idx_ong_usuario ON tabela_ong(usuario_id);