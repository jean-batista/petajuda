package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.model.Campanha;

@Mapper(componentModel = "spring")
public interface CampanhaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ong", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    Campanha paraEntidade(CampanhaRequest request);
    CampanhaResponse paraDto(Campanha campanha);
}