package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.model.Usuario;

/*
    ===================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Usuario ==
    ===================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UsuarioMapper {
    
    // Converte um Dto UsuarioInfoRequest em uma entidade Usuario
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "ong", ignore = true)
    @Mapping(target = "tipoPerfil", ignore = true)
    @Mapping(target = "animais", ignore = true)
    @Mapping(target = "publicacoes", ignore = true)
    @Mapping(target = "senha", ignore = true)
    Usuario paraEntidade(UsuarioInfoRequest usuarioInfoRequest);

    // Converte uma entidade Usuario em um Dto UsuarioInfoResponse
    @Mapping(target = "nomeCompleto", expression = "java(entidade.getNome() + \" \" + entidade.getSobrenome())")
    UsuarioInfoResponse paraUsuarioInfo(Usuario entidade);
}