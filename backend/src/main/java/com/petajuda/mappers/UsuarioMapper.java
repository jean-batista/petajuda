package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.model.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    
    Usuario paraEntidade(UsuarioInfoRequest usuarioInfoRequest);

    @Mapping(target = "nomeCompleto", expression = "java(entidade.getNome() + \" \" + entidade.getSobrenome())")
    UsuarioInfoResponse paraUsuarioInfo(Usuario entidade);
}
