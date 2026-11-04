package com.petajuda.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.model.Animal;

/*
    ==================================================================================
    == Interface responsavel pela conversao entre entidade e dto referente a Animal ==
    ==================================================================================
*/

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AnimalMapper {
    
    // Converte um Dto AnimalRequest em uma entidade Animal
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Animal paraEntidade(AnimalRequest animalRequest);

    // Converte uma entidade Animal em um Dto AnimalResponse
    @Mapping(target = "usuarioId", source = "usuario.id")
    AnimalResponse paraDto(Animal animal);

}