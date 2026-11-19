package com.petajuda.unittests.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.dtos.response.UsuarioInfoResponse;
import com.petajuda.enums.PerfilUsuario;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.UsuarioMapper;
import com.petajuda.model.Endereco;
import com.petajuda.model.Usuario;

public class UsuarioMapperTest {

    private UsuarioMapper usuarioMapper;

    @BeforeEach
    void setUp() {
        usuarioMapper = Mappers.getMapper(UsuarioMapper.class);
        EnderecoMapper enderecoMapper = Mappers.getMapper(EnderecoMapper.class);

        // Injeta manualmente o EnderecoMapper na implementação gerada pelo MapStruct,
        // já que o contexto do Spring (@Autowired) não está ativo em testes unitários.
        ReflectionTestUtils.setField(usuarioMapper, "enderecoMapper", enderecoMapper);
    }

    @Test
    @DisplayName("UsuarioMapper: Deve mapear UsuarioInfoRequest para Entidade Usuario incluindo nascimento e endereço")
    void deveMapearUsuarioInfoRequestParaEntidade() {
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Tubarão", "Centro", "Rua XV de Novembro", "Apto 101");
        UsuarioInfoRequest request = new UsuarioInfoRequest(
                "João",
                "Silva",
                "48999998888",
                LocalDate.of(1995, 5, 15),
                "joao@email.com",
                "senha123",
                enderecoDto
        );

        Usuario entidade = usuarioMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getAtivo()).isNull();
        assertThat(entidade.getDataCriacao()).isNull();
        assertThat(entidade.getOng()).isNull();
        assertThat(entidade.getTipoPerfil()).isNull();
        assertThat(entidade.getNome()).isEqualTo(request.nome());
        assertThat(entidade.getSobrenome()).isEqualTo(request.sobrenome());
        assertThat(entidade.getTelefone()).isEqualTo(request.telefone());
        assertThat(entidade.getNascimento()).isEqualTo(request.nascimento());
        assertThat(entidade.getEmail()).isEqualTo(request.email());

        assertThat(entidade.getEndereco()).isNotNull();
        assertThat(entidade.getEndereco().getEstado()).isEqualTo(enderecoDto.estado());
        assertThat(entidade.getEndereco().getCidade()).isEqualTo(enderecoDto.cidade());
        assertThat(entidade.getEndereco().getBairro()).isEqualTo(enderecoDto.bairro());
        assertThat(entidade.getEndereco().getRua()).isEqualTo(enderecoDto.rua());
        assertThat(entidade.getEndereco().getComplemento()).isEqualTo(enderecoDto.complemento());
    }

    @Test
    @DisplayName("UsuarioMapper: Deve mapear Entidade Usuario para UsuarioInfoResponse incluindo nascimento e endereço")
    void deveMapearEntidadeUsuarioParaUsuarioInfoResponse() {
        Endereco endereco = new Endereco("SC", "Laguna", "Magalhães", "Rua das Flores", "Casa 2");
        Usuario entidade = new Usuario(
                UUID.randomUUID(),
                "Maria",
                "Oliveira",
                "maria@email.com",
                "48988887777",
                LocalDate.of(1998, 10, 20),
                "hash123",
                true,
                LocalDateTime.now(),
                PerfilUsuario.USUARIO_COMUM,
                endereco,
                null,
                null,
                null
        );

        UsuarioInfoResponse response = usuarioMapper.paraUsuarioInfo(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.nomeCompleto()).isEqualTo("Maria Oliveira");
        assertThat(response.email()).isEqualTo(entidade.getEmail());
        assertThat(response.telefone()).isEqualTo(entidade.getTelefone());
        assertThat(response.nascimento()).isEqualTo(entidade.getNascimento());
        assertThat(response.tipoPerfil()).isEqualTo(PerfilUsuario.USUARIO_COMUM);
        assertThat(response.ativo()).isTrue();
        assertThat(response.dataCriacao()).isEqualTo(entidade.getDataCriacao());

        assertThat(response.endereco()).isNotNull();
        assertThat(response.endereco().estado()).isEqualTo(endereco.getEstado());
        assertThat(response.endereco().cidade()).isEqualTo(endereco.getCidade());
        assertThat(response.endereco().bairro()).isEqualTo(endereco.getBairro());
        assertThat(response.endereco().rua()).isEqualTo(endereco.getRua());
        assertThat(response.endereco().complemento()).isEqualTo(endereco.getComplemento());
    }
}