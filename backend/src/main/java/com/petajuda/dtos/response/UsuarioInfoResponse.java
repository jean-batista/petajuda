package com.petajuda.dtos.response;

import java.util.Set;
import java.util.UUID;

import com.petajuda.enums.PerfilUsuario;

public record UsuarioInfoResponse(
    UUID id,
    String nomeCompleto,
    String usuario,
    Set<PerfilUsuario> perfil,
    String token
) {}
