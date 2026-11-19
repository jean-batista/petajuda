package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.model.Endereco;

public class EnderecoMapperTest {
    
    private EnderecoMapper enderecoMapper;

    @BeforeEach
    void setUp() {
        enderecoMapper = Mappers.getMapper(EnderecoMapper.class);
    }

    @Test
    @DisplayName("EnderecoMapper: Deve mapear EnderecoDto para Entidade Endereco")
    void deveMapearEnderecoDtoParaEntidade() {
        EnderecoDto dto = new EnderecoDto("SC", "Tubarão", "Centro", "Rua Altamiro Guimarães", "Apto 101");

        Endereco entidade = enderecoMapper.paraEntidade(dto);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getEstado()).isEqualTo(dto.estado());
        assertThat(entidade.getCidade()).isEqualTo(dto.cidade());
        assertThat(entidade.getBairro()).isEqualTo(dto.bairro());
        assertThat(entidade.getRua()).isEqualTo(dto.rua());
        assertThat(entidade.getComplemento()).isEqualTo(dto.complemento());
    }

    @Test
    @DisplayName("EnderecoMapper: Deve mapear Entidade Endereco para EnderecoDto")
    void deveMapearEntidadeEnderecoParaDto() {
        Endereco entidade = new Endereco("SC", "Tubarão", "Oficinas", "Rua Marcolino Martins Cabral", "Bloco B");

        EnderecoDto dto = enderecoMapper.paraDto(entidade);

        assertThat(dto).isNotNull();
        assertThat(dto.estado()).isEqualTo(entidade.getEstado());
        assertThat(dto.cidade()).isEqualTo(entidade.getCidade());
        assertThat(dto.bairro()).isEqualTo(entidade.getBairro());
        assertThat(dto.rua()).isEqualTo(entidade.getRua());
        assertThat(dto.complemento()).isEqualTo(entidade.getComplemento());
    }

}
