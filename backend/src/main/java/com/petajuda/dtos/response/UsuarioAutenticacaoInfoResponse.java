package com.petajuda.dtos.response;

import java.util.UUID;

import com.petajuda.enums.PerfilUsuario;

public record UsuarioAutenticacaoInfoResponse(
    UUID id,
    String nomeCompleto,
    String email,
    PerfilUsuario perfil,
    String token
) {}
