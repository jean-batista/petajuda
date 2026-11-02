package com.petajuda.dtos.response;

import java.util.UUID;

import com.petajuda.enums.PerfilUsuario;

public record UsuarioAutenticacaoInfoResponse(
    UUID id,
    String nomeCompleto,
    String usuario,
    PerfilUsuario perfil,
    String token
) {}
