package com.petajuda.dtos.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CampanhaRequest(
    
    @NotBlank(message = "O título da campanha é obrigatório.")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres.")
    String titulo,

    @NotBlank(message = "A descrição da campanha é obrigatória.")
    String descricao,

    @NotNull(message = "A data de início é obrigatória.")
    @FutureOrPresent(message = "A data de início não pode ser no passado.")
    LocalDateTime inicio,

    @NotNull(message = "A data de término é obrigatória.")
    @Future(message = "A data de término deve ser no futuro.")
    LocalDateTime fim
) {
}