package com.petajuda.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.enums.StatusDenuncia;

public record DenunciaResponse(
    UUID id,
    String titulo,
    String descricao,
    String fotoUrl,
    LocalDateTime data,
    StatusDenuncia status,
    EnderecoDto endereco
) {
}