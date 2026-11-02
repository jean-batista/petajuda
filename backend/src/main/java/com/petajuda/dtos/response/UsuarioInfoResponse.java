package com.petajuda.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.petajuda.enums.PerfilUsuario;

public record UsuarioInfoResponse(
        UUID id,
        String nomeCompleto,
        String email,
        String telefone,
        PerfilUsuario tipoPerfil,
        LocalDateTime dataCriacao,
        Boolean ativo
) {}
