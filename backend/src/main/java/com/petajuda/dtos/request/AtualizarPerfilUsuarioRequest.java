package com.petajuda.dtos.request;

import java.time.LocalDate;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.validations.annotation.IdadeMaxima;
import com.petajuda.validations.annotation.MaiorIdade;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtualizarPerfilUsuarioRequest(
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

        @NotNull(message = "O endereço é obrigatório")
        @Valid
        EnderecoDto endereco
) {}