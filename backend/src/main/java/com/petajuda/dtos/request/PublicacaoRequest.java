package com.petajuda.dtos.request;

import java.util.UUID;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.enums.TipoPublicacao;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PublicacaoRequest(
    
    @NotBlank(message = "O título é obrigatório.")
    @Size(max = 50, message = "O título deve ter no máximo 50 caracteres.")
    String titulo,

    @NotBlank(message = "A descrição é obrigatória.")
    String descricao,

    @NotNull(message = "O tipo da publicação é obrigatório.")
    TipoPublicacao tipo,

    UUID animalId,

    @NotNull(message = "O endereço é obrigatório.")
    @Valid
    EnderecoDto endereco
) {
}