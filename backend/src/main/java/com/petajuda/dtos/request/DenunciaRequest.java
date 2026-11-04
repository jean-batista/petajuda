package com.petajuda.dtos.request;

import com.petajuda.dtos.EnderecoDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DenunciaRequest(
    
    @NotBlank(message = "O título da denúncia é obrigatório.")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres.")
    String titulo,

    @NotBlank(message = "A descrição detalhada da ocorrência é obrigatória.")
    String descricao,

    @NotBlank(message = "A URL da foto de evidência é obrigatória.")
    String fotoUrl,

    @NotNull(message = "O endereço da ocorrência é obrigatório.")
    @Valid
    EnderecoDto endereco
) {
}