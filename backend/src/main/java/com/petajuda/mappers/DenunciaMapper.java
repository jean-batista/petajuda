package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.model.Denuncia;

@Mapper(componentModel = "spring", uses = {EnderecoMapper.class})
public interface DenunciaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "data", ignore = true)
    @Mapping(target = "status", ignore = true)
    Denuncia paraEntidade(DenunciaRequest request);

    @Mapping(target = "endereco", source = "endereco")
    DenunciaResponse paraDto(Denuncia denuncia);
}