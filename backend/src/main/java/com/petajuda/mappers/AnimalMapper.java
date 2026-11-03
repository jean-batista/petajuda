package com.petajuda.mappers;

import org.mapstruct.Mapper;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.model.Animal;

@Mapper(componentModel = "spring")
public interface AnimalMapper {
    
    Animal paraEntidade(AnimalRequest animalRequest);
    AnimalResponse paraDto(Animal animal);

}
