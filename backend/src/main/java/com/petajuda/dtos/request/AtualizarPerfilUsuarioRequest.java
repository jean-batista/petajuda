package com.petajuda.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record AtualizarPerfilUsuarioRequest(
    @NotBlank(message = "O primeiro nome é obrigatório")
    String nome,

    @NotBlank(message = "O sobrenome é obrigatório")
    String sobrenome,

    @NotBlank(message = "O telefone é obrigatório")
    String telefone
) {}