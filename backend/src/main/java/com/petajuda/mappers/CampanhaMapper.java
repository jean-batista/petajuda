package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.model.Campanha;

/*
    ====================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Campanha ==
    ====================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CampanhaMapper {

    // Converte um Dto CampanhaRequest em uma entidade Campanha
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ong", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    Campanha paraEntidade(CampanhaRequest request);

    // Converte uma entidade Campanha em um Dto CampanhaResponse
    @Mapping(target = "ongId", source = "ong.id")
    @Mapping(target = "ongNome", source = "ong.nome")
    CampanhaResponse paraDto(Campanha campanha);
}