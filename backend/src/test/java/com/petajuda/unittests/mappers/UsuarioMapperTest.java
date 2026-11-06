package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.enums.PerfilUsuario;
import com.petajuda.mappers.UsuarioMapper;
import com.petajuda.model.Usuario;

public class UsuarioMapperTest {
    
    private UsuarioMapper usuarioMapper;

    @BeforeEach
    void setUp() {
        usuarioMapper = Mappers.getMapper(UsuarioMapper.class);
    }

    @Test
    @DisplayName("UsuarioMapper: Deve mapear UsuarioInfoRequest para Entidade Usuario")
    void deveMapearUsuarioInfoRequestParaEntidade() {
        UsuarioInfoRequest request = new UsuarioInfoRequest("João", "Silva", "joao@email.com", "48999998888", "senha123");

        Usuario entidade = usuarioMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getAtivo()).isNull();
        assertThat(entidade.getDataCriacao()).isNull();
        assertThat(entidade.getOng()).isNull();
        assertThat(entidade.getTipoPerfil()).isNull();
        assertThat(entidade.getNome()).isEqualTo(request.nome());
        assertThat(entidade.getSobrenome()).isEqualTo(request.sobrenome());
        assertThat(entidade.getEmail()).isEqualTo(request.email());
        assertThat(entidade.getTelefone()).isEqualTo(request.telefone());
    }

    @Test
    @DisplayName("UsuarioMapper: Deve mapear Entidade Usuario para UsuarioInfoResponse concatenando nomeCompleto")
    void deveMapearEntidadeUsuarioParaUsuarioInfoResponse() {
        Usuario entidade = new Usuario(UUID.randomUUID(), "Maria", "Oliveira", "maria@email.com", "48988887777", "hash123", true, LocalDateTime.now(), PerfilUsuario.USUARIO_COMUM, null, null, null);

        UsuarioInfoResponse response = usuarioMapper.paraUsuarioInfo(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.nomeCompleto()).isEqualTo("Maria Oliveira");
        assertThat(response.email()).isEqualTo(entidade.getEmail());
        assertThat(response.telefone()).isEqualTo(entidade.getTelefone());
    }
}
