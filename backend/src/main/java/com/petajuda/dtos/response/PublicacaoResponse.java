package com.petajuda.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.enums.TipoPublicacao;

public record PublicacaoResponse(
    UUID id,
    String titulo,
    String descricao,
    String fotoUrl,
    LocalDateTime data,
    StatusPublicacao status,
    TipoPublicacao tipo,
    EnderecoDto endereco,

    UUID usuarioId,
    String usuarioNome,
    String usuarioTelefone,

    AnimalResponse animal
) {
}