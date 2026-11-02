package com.petajuda.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioCredenciaisRequest(
        @NotBlank(message = "O nome de usuário não pode ser vazio")
        @Size(min = 4, max = 50, message = "O nome de usuário deve ter entre 4 e 50 caracteres")
        String email,

        @NotBlank(message = "A senha não pode ser vazia")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String senha
) {}
