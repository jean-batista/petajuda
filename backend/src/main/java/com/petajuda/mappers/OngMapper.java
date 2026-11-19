package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.model.Ong;

/*
    ====================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Camapnha ==
    ====================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {EnderecoMapper.class})
public interface OngMapper {
    
    // Converte um Dto OngRequest em uma entidade Ong
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "campanhas", ignore = true)
    Ong paraEntidade(OngRequest ongRequest);

    // Converte uma entidade Ong em um Dto OngResponse
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "endereco", source = "endereco")
    OngResponse paraDto(Ong ong);

}