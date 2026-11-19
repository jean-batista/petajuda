package com.petajuda.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record CampanhaResponse(
    UUID id,
    String titulo,
    String descricao,
    LocalDateTime inicio,
    LocalDateTime fim,
    Boolean ativo,
    
    UUID ongId,
    String ongNome
) {
}