package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.model.Publicacao;

/*
    ======================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Publicacao ==
    ======================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {EnderecoMapper.class, AnimalMapper.class})
public interface PublicacaoMapper {

    // Converte um Dto PublicacaoRequest em uma entidade Publicacao
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "animal", ignore = true)
    @Mapping(target = "data", ignore = true)
    @Mapping(target = "status", ignore = true)
    Publicacao paraEntidade(PublicacaoRequest request);

    // Converte uma entidade Publicacao em um Dto PublicacaoResponse
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "usuarioTelefone", source = "usuario.telefone")
    @Mapping(target = "animal", source = "animal")
    PublicacaoResponse paraDto(Publicacao publicacao);
}