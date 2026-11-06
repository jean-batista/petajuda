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
import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.enums.TipoPublicacao;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.PublicacaoMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Endereco;
import com.petajuda.model.Publicacao;
import com.petajuda.model.Usuario;

class PublicacaoMapperTest {

    private PublicacaoMapper publicacaoMapper;

    @BeforeEach
    void setUp() {
        publicacaoMapper = Mappers.getMapper(PublicacaoMapper.class);
        EnderecoMapper enderecoMapper = Mappers.getMapper(EnderecoMapper.class);
        ReflectionTestUtils.setField(publicacaoMapper, "enderecoMapper", enderecoMapper);
    }

    @Test
    @DisplayName("PublicacaoMapper: Deve mapear PublicacaoRequest para Entidade Publicacao")
    void deveMapearPublicacaoRequestParaEntidade() {
        UUID animalId = UUID.randomUUID();
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Capivari de Baixo", "Centro", "Rua João Pessoa", "12");
        PublicacaoRequest request = new PublicacaoRequest("Cão Perdido", "Fugiu de casa", TipoPublicacao.PERDIDO, animalId, enderecoDto);

        Publicacao entidade = publicacaoMapper.paraEntidade(request);

        assertThat(entidade).isNotNull();
        assertThat(entidade.getId()).isNull();
        assertThat(entidade.getUsuario()).isNull();
        assertThat(entidade.getAnimal()).isNull();
        assertThat(entidade.getData()).isNull();
        assertThat(entidade.getStatus()).isNull();
        assertThat(entidade.getTitulo()).isEqualTo(request.titulo());
        assertThat(entidade.getTipo()).isEqualTo(request.tipo());
        assertThat(entidade.getEndereco()).isNotNull();
        assertThat(entidade.getEndereco().getCidade()).isEqualTo("Capivari de Baixo");
    }

    @Test
    @DisplayName("PublicacaoMapper: Deve mapear Entidade Publicacao para PublicacaoResponse achatando Usuario e Animal")
    void deveMapearEntidadePublicacaoParaResponse() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setNome("Carlos");
        usuario.setTelefone("48977776666");

        UUID animalId = UUID.randomUUID();
        Animal animal = new Animal();
        animal.setId(animalId);
        animal.setNome("Thor");
        animal.setFotoUrl("http://foto.com/thor.jpg");

        Endereco endereco = new Endereco("SC", "Capivari de Baixo", "Centro", "Rua João Pessoa", "12");

        Publicacao entidade = new Publicacao(
                UUID.randomUUID(),
                "Cão Perdido",
                "Fugiu no centro",
                LocalDateTime.now(),
                StatusPublicacao.ATIVO,
                TipoPublicacao.PERDIDO,
                usuario,
                animal,
                endereco
        );

        PublicacaoResponse response = publicacaoMapper.paraDto(entidade);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(entidade.getId());
        assertThat(response.titulo()).isEqualTo(entidade.getTitulo());
        
        // Valida atributos achatados do Usuario
        assertThat(response.usuarioId()).isEqualTo(usuarioId);
        assertThat(response.usuarioNome()).isEqualTo("Carlos");
        assertThat(response.usuarioTelefone()).isEqualTo("48977776666");

        // Valida atributos achatados do Animal
        assertThat(response.animalId()).isEqualTo(animalId);
        assertThat(response.animalNome()).isEqualTo("Thor");
        assertThat(response.animalFotoUrl()).isEqualTo("http://foto.com/thor.jpg");

        // Valida Endereco embutido
        assertThat(response.endereco()).isNotNull();
        assertThat(response.endereco().cidade()).isEqualTo("Capivari de Baixo");
    }
}
