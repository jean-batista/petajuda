package com.petajuda.dtos.request;

import java.time.LocalDate;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.validations.annotation.IdadeMaxima;
import com.petajuda.validations.annotation.MaiorIdade;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioInfoRequest(
        @NotBlank(message = "O primeiro nome é obrigatório")
        String nome,

        @NotBlank(message = "O sobrenome é obrigatório")
        String sobrenome,

        @NotBlank(message = "O telefone é obrigatório")
        String telefone,

        @NotNull(message = "A data de nascimento é obrigatória")
        @MaiorIdade
        @IdadeMaxima(value = 150)
        LocalDate nascimento,

        @NotBlank(message = "O nome de utilizador é obrigatório")
        @Size(min = 4, max = 50, message = "O nome de utilizador deve ter entre 4 e 50 caracteres")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String senha,

        @NotNull(message = "O endereço é obrigatório")
        @Valid
        EnderecoDto endereco
) {
}