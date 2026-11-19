-- Torna o relacionamento com animal opcional para permitir publicações rápidas de animais encontrados na rua
ALTER TABLE tabela_publicacao
    ALTER COLUMN animal_id DROP NOT NULL;

-- Adiciona a coluna foto_url como TEXT para comportar URLs completas sem limite de caracteres
ALTER TABLE tabela_publicacao
    ADD COLUMN foto_url TEXT;