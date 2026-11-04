package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.model.Publicacao;

@Mapper(componentModel = "spring", uses = {EnderecoMapper.class})
public interface PublicacaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "animal", ignore = true)
    @Mapping(target = "data", ignore = true)
    @Mapping(target = "status", ignore = true)
    Publicacao paraEntidade(PublicacaoRequest request);

    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "usuarioTelefone", source = "usuario.telefone")
    @Mapping(target = "animalId", source = "animal.id")
    @Mapping(target = "animalNome", source = "animal.nome")
    @Mapping(target = "animalFotoUrl", source = "animal.fotoUrl")
    PublicacaoResponse paraDto(Publicacao publicacao);
}