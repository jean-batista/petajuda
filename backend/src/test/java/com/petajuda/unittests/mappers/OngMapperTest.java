package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.OngMapper;
import com.petajuda.model.Endereco;
import com.petajuda.model.Ong;
import com.petajuda.model.Usuario;

class OngMapperTest {

    private OngMapper ongMapper;

    @BeforeEach
    void setUp() {
        ongMapper = Mappers.getMapper(OngMapper.class);
        EnderecoMapper enderecoMapper = Mappers.getMapper(EnderecoMapper.class);
        ReflectionTestUtils.setField(ongMapper, "enderecoMapper", enderecoMapper);
    }

    @Test
    @DisplayName("OngMapper: Deve mapear OngRequest para Entidade Ong")
    void deveMapearOngRequestParaEntidade() {
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Imbituba", "Vila Nova", "Rua das Flores", "100");
        OngRequest request = new OngRequest("Patas de Luz", "Associação Patas de Luz", "12345678000199", "pix@patas.org", "Resgate de animais", enderecoDto);

        Ong entidade = ongMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getUsuario()).isNull();
        assertThat(entidade.getCampanhas()).isEmpty();
        assertThat(entidade.getNome()).isEqualTo(request.nome());
        assertThat(entidade.getCnpj()).isEqualTo(request.cnpj());
        assertThat(entidade.getEndereco()).isNotNull();
        assertThat(entidade.getEndereco().getCidade()).isEqualTo("Imbituba");
    }

    @Test
    @DisplayName("OngMapper: Deve mapear Entidade Ong para OngResponse com usuarioId achatado")
    void deveMapearEntidadeOngParaResponse() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);

        Endereco endereco = new Endereco("SC", "Imbituba", "Vila Nova", "Rua das Flores", "100");
        Ong entidade = new Ong(UUID.randomUUID(), "Patas de Luz", "Associação Patas de Luz", "12345678000199", "pix@patas.org", "Resgate", usuario, null, endereco);

        OngResponse response = ongMapper.paraDto(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.nome()).isEqualTo(entidade.getNome());
        assertThat(response.usuarioId()).isEqualTo(usuarioId);
        assertThat(response.endereco()).isNotNull();
        assertThat(response.endereco().cidade()).isEqualTo("Imbituba");
    }
}
