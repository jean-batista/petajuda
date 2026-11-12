package com.petajuda.dtos.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.enums.PerfilUsuario;

public record UsuarioInfoResponse(
        UUID id,
        String nomeCompleto,
        String email,
        String telefone,
        LocalDate nascimento,
        PerfilUsuario tipoPerfil,
        EnderecoDto endereco,
        LocalDateTime dataCriacao,
        Boolean ativo
) {}