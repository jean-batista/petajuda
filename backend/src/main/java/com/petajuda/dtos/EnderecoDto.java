package com.petajuda.dtos;

import jakarta.validation.constraints.NotBlank;

public record EnderecoDto(
    @NotBlank(message = "O estado é obrigatório")
    String estado,

    @NotBlank(message = "A cidade é obrigatória")
    String cidade,

    @NotBlank(message = "O bairro é obrigatório")
    String bairro,

    @NotBlank(message = "A rua é obrigatória")
    String rua,

    String complemento
) {
}