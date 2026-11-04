package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.model.Endereco;

/*
    ====================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Endereco ==
    ====================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EnderecoMapper {

    // Converte um Dto EnderecoRequest em uma entidade Endereco
    Endereco paraEntidade(EnderecoDto dto);

    // Converte uma entidade Endereco em um Dto EnderecoResponse
    EnderecoDto paraDto(Endereco entidade);
}