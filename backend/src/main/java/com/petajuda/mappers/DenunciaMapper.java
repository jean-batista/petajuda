package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.model.Denuncia;

/*
    ====================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Camapnha ==
    ====================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {EnderecoMapper.class})
public interface DenunciaMapper {

    // Converte um Dto DenunciaRequest em uma entidade Denuncia
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "data", ignore = true)
    @Mapping(target = "status", ignore = true)
    Denuncia paraEntidade(DenunciaRequest request);
    
    // Converte uma entidade Denuncia em um Dto DenunciaResponse
    @Mapping(target = "endereco", source = "endereco")
    DenunciaResponse paraDto(Denuncia denuncia);
}