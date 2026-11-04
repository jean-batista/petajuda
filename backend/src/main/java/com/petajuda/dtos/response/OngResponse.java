package com.petajuda.dtos.response;

import java.util.List;
import java.util.UUID;

import com.petajuda.model.Campanha;
import com.petajuda.model.Endereco;

public record OngResponse(
    UUID id,
    String nome,
    String razaoSocial,
    String cnpj,
    String chavePix,
    String descricao,
    List<Campanha> campanhas,
    Endereco endereco,

    UUID usuarioId
) {}
