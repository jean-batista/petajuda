package com.petajuda.dtos.response;

import com.petajuda.dtos.EnderecoDto;

import java.util.List;
import java.util.UUID;

public record OngResponse(
    UUID id,
    String nome,
    String razaoSocial,
    String cnpj,
    String chavePix,
    String descricao,
    List<CampanhaResponse> campanhas,
    EnderecoDto endereco,

    UUID usuarioId
) {}
