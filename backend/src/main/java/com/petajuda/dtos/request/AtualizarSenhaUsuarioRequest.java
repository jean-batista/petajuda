package com.petajuda.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarSenhaUsuarioRequest(
        @NotBlank(message = "A senha atual é obrigatória")
        @Size(min = 8, message = "A senha atual deve ter no mínimo 8 caracteres")
        String senhaAntiga,

        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres")
        String senhaNova
) {}