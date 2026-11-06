package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;
import com.petajuda.mappers.AnimalMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Usuario;

class AnimalMapperTest {

    private AnimalMapper animalMapper;

    @BeforeEach
    void setUp() {
        animalMapper = Mappers.getMapper(AnimalMapper.class);
    }

    @Test
    @DisplayName("AnimalMapper: Deve mapear AnimalRequest para Entidade Animal")
    void deveMapearAnimalRequestParaEntidade() {
        AnimalRequest request = new AnimalRequest("Rex", "Macho", "Caramelo", true, true, "Cão dócil", "http://foto.com/rex.jpg", IdadeAnimal.ADULTO, PorteAnimal.MEDIO, EspecieAnimal.CACHORRO);

        Animal entidade = animalMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getUsuario()).isNull();
        assertThat(entidade.getNome()).isEqualTo(request.nome());
        assertThat(entidade.getSexo()).isEqualTo(request.sexo());
        assertThat(entidade.getCorPredominante()).isEqualTo(request.corPredominante());
        assertThat(entidade.isCastrado()).isEqualTo(request.castrado());
        assertThat(entidade.isVacinado()).isEqualTo(request.vacinado());
        assertThat(entidade.getDescricao()).isEqualTo(request.descricao());
        assertThat(entidade.getFotoUrl()).isEqualTo(request.fotoUrl());
        assertThat(entidade.getIdade()).isEqualTo(request.idade());
        assertThat(entidade.getPorte()).isEqualTo(request.porte());
        assertThat(entidade.getEspecie()).isEqualTo(request.especie());
    }

    @Test
    @DisplayName("AnimalMapper: Deve mapear Entidade Animal para AnimalResponse com usuarioId achatado")
    void deveMapearEntidadeAnimalParaResponse() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);

        Animal entidade = new Animal(
            UUID.randomUUID(),
            "Rex",
            "Macho",
            "Caramelo",
            true,
            true,
            "Cão dócil",
            "http://foto.com/rex.jpg",
            IdadeAnimal.ADULTO,
            PorteAnimal.MEDIO,
            EspecieAnimal.CACHORRO,
            usuario,
            null
        );

        AnimalResponse response = animalMapper.paraDto(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.nome()).isEqualTo(entidade.getNome());
        assertThat(response.usuarioId()).isEqualTo(usuarioId);
    }

}