package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.mappers.CampanhaMapper;
import com.petajuda.model.Campanha;
import com.petajuda.model.Ong;

public class CampanhaMapperTest {
    
    private CampanhaMapper campanhaMapper;

    @BeforeEach
    void setUp() {
        campanhaMapper = Mappers.getMapper(CampanhaMapper.class);
    }

    @Test
    @DisplayName("CampanhaMapper: Deve mapear CampanhaRequest para Entidade Campanha")
    void deveMapearCampanhaRequestParaEntidade() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(1);
        LocalDateTime fim = LocalDateTime.now().plusDays(10);
        CampanhaRequest request = new CampanhaRequest("Feira de Adoção", "Venha adotar", inicio, fim);

        Campanha entidade = campanhaMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getOng()).isNull();
        assertThat(entidade.getAtivo()).isNull();
        assertThat(entidade.getTitulo()).isEqualTo(request.titulo());
        assertThat(entidade.getDescricao()).isEqualTo(request.descricao());
        assertThat(entidade.getInicio()).isEqualTo(request.inicio());
        assertThat(entidade.getFim()).isEqualTo(request.fim());
    }

    @Test
    @DisplayName("CampanhaMapper: Deve mapear Entidade Campanha para CampanhaResponse com dados da ONG achatados")
    void deveMapearEntidadeCampanhaParaResponse() {
        UUID ongId = UUID.randomUUID();
        Ong ong = new Ong();
        ong.setId(ongId);
        ong.setNome("Patas de Luz");

        Campanha entidade = new Campanha(UUID.randomUUID(), "Arrecadação Ração", "Ajude com ração", LocalDateTime.now(), LocalDateTime.now().plusDays(5), true, ong);

        CampanhaResponse response = campanhaMapper.paraDto(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.titulo()).isEqualTo(entidade.getTitulo());
        assertThat(response.ongId()).isEqualTo(ongId);
        assertThat(response.ongNome()).isEqualTo("Patas de Luz");
    }
}
