package com.petajuda.dtos.response;

import java.util.List;
import java.util.UUID;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.model.Campanha;

public record OngResponse(
    UUID id,
    String nome,
    String razaoSocial,
    String cnpj,
    String chavePix,
    String descricao,
    List<Campanha> campanhas,
    EnderecoDto endereco,

    UUID usuarioId
) {}
