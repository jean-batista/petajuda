package com.petajuda.dtos.request;

import java.util.List;

import com.petajuda.model.Campanha;
import com.petajuda.model.Endereco;

public record OngRequest(
    String nome,
    String razaoSocial,
    String cnpj,
    String chavePix,
    String descricao,
    List<Campanha> campanhas,
    Endereco endereco
) {}
