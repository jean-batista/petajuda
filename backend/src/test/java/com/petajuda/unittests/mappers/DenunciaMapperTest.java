package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.mappers.DenunciaMapper;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.model.Denuncia;
import com.petajuda.model.Endereco;

public class DenunciaMapperTest {

    private DenunciaMapper denunciaMapper;

    @BeforeEach
    void setUp() {
        denunciaMapper = Mappers.getMapper(DenunciaMapper.class);
        EnderecoMapper enderecoMapper = Mappers.getMapper(EnderecoMapper.class);
        ReflectionTestUtils.setField(denunciaMapper, "enderecoMapper", enderecoMapper);
    }

    @Test
    @DisplayName("DenunciaMapper: Deve mapear DenunciaRequest para Entidade Denuncia")
    void deveMapearDenunciaRequestParaEntidade() {
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Laguna", "Mar Grosso", "Av. Senador Gallotti", "S/N");
        DenunciaRequest request = new DenunciaRequest("Maus-tratos", "Cão preso sem água", "http://foto.com/evidencia.jpg", enderecoDto);

        Denuncia entidade = denunciaMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getData()).isNull();
        assertThat(entidade.getStatus()).isNull();
        assertThat(entidade.getTitulo()).isEqualTo(request.titulo());
        assertThat(entidade.getDescricao()).isEqualTo(request.descricao());
        assertThat(entidade.getFotoUrl()).isEqualTo(request.fotoUrl());
        assertThat(entidade.getEndereco()).isNotNull();
        assertThat(entidade.getEndereco().getCidade()).isEqualTo("Laguna");
    }

    @Test
    @DisplayName("DenunciaMapper: Deve mapear Entidade Denuncia para DenunciaResponse com EnderecoDto")
    void deveMapearEntidadeDenunciaParaResponse() {
        Endereco endereco = new Endereco("SC", "Laguna", "Mar Grosso", "Av. Senador Gallotti", "S/N");
        Denuncia entidade = new Denuncia(UUID.randomUUID(), "Maus-tratos", "Cão abandonado", "http://foto.com/evidencia.jpg", LocalDateTime.now(), StatusDenuncia.PENDENTE, endereco);

        DenunciaResponse response = denunciaMapper.paraDto(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.titulo()).isEqualTo(entidade.getTitulo());
        assertThat(response.status()).isEqualTo(StatusDenuncia.PENDENTE);
        assertThat(response.endereco()).isNotNull();
        assertThat(response.endereco().cidade()).isEqualTo("Laguna");
    }
}
