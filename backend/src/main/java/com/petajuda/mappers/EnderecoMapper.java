package com.petajuda.mappers;

import org.mapstruct.Mapper;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.model.Endereco;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    Endereco paraEntidade(EnderecoDto dto);
    EnderecoDto paraDto(Endereco entidade);
}