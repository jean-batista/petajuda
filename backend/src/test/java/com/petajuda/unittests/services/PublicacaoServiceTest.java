package com.petajuda.unittests.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.enums.TipoPublicacao;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.PublicacaoMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Endereco;
import com.petajuda.model.Publicacao;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.AnimalRepository;
import com.petajuda.repositories.PublicacaoRepository;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.services.PublicacaoService;

@ExtendWith(MockitoExtension.class)
class PublicacaoServiceTest {

    @Mock
    private PublicacaoRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private PublicacaoMapper mapper;

    @Mock
    private EnderecoMapper enderecoMapper;

    @InjectMocks
    private PublicacaoService publicacaoService;

    private Usuario usuarioLogado;
    private Animal animal;
    private Publicacao publicacao;
    private PublicacaoRequest publicacaoRequest;
    private PublicacaoResponse publicacaoResponse;
    private UUID usuarioId;
    private UUID animalId;
    private UUID publicacaoId;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        animalId = UUID.randomUUID();
        publicacaoId = UUID.randomUUID();

        Endereco endereco = new Endereco("SC", "Tubarão", "Oficinas", "Rua A", "100");
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Tubarão", "Oficinas", "Rua A", "100");

        usuarioLogado = new Usuario();
        usuarioLogado.setId(usuarioId);
        usuarioLogado.setNome("Maria");

        animal = new Animal();
        animal.setId(animalId);
        animal.setNome("Thor");
        animal.setUsuario(usuarioLogado); // Animal pertence à Maria

        publicacao = new Publicacao();
        publicacao.setId(publicacaoId);
        publicacao.setTitulo("Cachorro Perdido");
        publicacao.setDescricao("Fugiu no bairro Oficinas");
        publicacao.setTipo(TipoPublicacao.PERDIDO);
        publicacao.setStatus(StatusPublicacao.ATIVO);
        publicacao.setData(LocalDateTime.now());
        publicacao.setUsuario(usuarioLogado);
        publicacao.setAnimal(animal);
        publicacao.setEndereco(endereco);

        publicacaoRequest = new PublicacaoRequest(
            "Cachorro Perdido", "Fugiu no bairro Oficinas", TipoPublicacao.PERDIDO, animalId, enderecoDto
        );

        publicacaoResponse = new PublicacaoResponse(
            publicacaoId, "Cachorro Perdido", "Fugiu no bairro Oficinas", publicacao.getData(), 
            StatusPublicacao.ATIVO, TipoPublicacao.PERDIDO, enderecoDto, 
            usuarioId, "Maria", "48999999999", 
            animalId, "Thor", "url_foto_thor"
        );
    }

    // =========================================================================
    // CRIAR (SALVAR)
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve criar publicação se animal existir e pertencer ao usuário logado")
    void deveSalvarPublicacaoComSucesso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(mapper.paraEntidade(publicacaoRequest)).thenReturn(publicacao);
        when(repository.save(publicacao)).thenReturn(publicacao);
        when(mapper.paraDto(publicacao)).thenReturn(publicacaoResponse);

        PublicacaoResponse response = publicacaoService.salvar(usuarioId, publicacaoRequest);

        assertThat(response).isNotNull();
        assertThat(response.titulo()).isEqualTo("Cachorro Perdido");
        assertThat(publicacao.getStatus()).isEqualTo(StatusPublicacao.ATIVO); // Nasce ativa
        verify(repository).save(publicacao);
    }

    @Test
    @DisplayName("Salvar: Deve lançar UsuarioNaoAutorizadoException se tentar publicar para animal de outro dono")
    void deveLancarExcecaoAoCriarPublicacaoParaAnimalDeOutro() {
        UUID outroUsuarioId = UUID.randomUUID();
        Usuario outroUsuario = new Usuario();
        outroUsuario.setId(outroUsuarioId);
        animal.setUsuario(outroUsuario); // Animal pertence a outra pessoa

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));

        assertThatThrownBy(() -> publicacaoService.salvar(usuarioId, publicacaoRequest))
            .isInstanceOf(UsuarioNaoAutorizadoException.class)
            .hasMessageContaining("só pode criar publicações para animais cadastrados no seu perfil");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // BUSCAR
    // =========================================================================

    @Test
    @DisplayName("BuscarPorId: Deve retornar os detalhes da publicação")
    void deveBuscarPorIdComSucesso() {
        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));
        when(mapper.paraDto(publicacao)).thenReturn(publicacaoResponse);

        PublicacaoResponse response = publicacaoService.buscarPorId(publicacaoId);

        assertThat(response).isNotNull();
        verify(repository).findById(publicacaoId);
    }

    @Test
    @DisplayName("BuscarTodas: Deve retornar o feed de publicações")
    void deveBuscarTodasComSucesso() {
        when(repository.findAll()).thenReturn(List.of(publicacao));
        when(mapper.paraDto(publicacao)).thenReturn(publicacaoResponse);

        List<PublicacaoResponse> lista = publicacaoService.buscarTodas();

        assertThat(lista).isNotEmpty().hasSize(1);
    }

    // =========================================================================
    // ATUALIZAR
    // =========================================================================

    @Test
    @DisplayName("Atualizar: Deve atualizar os dados se o usuário logado for dono do post")
    void deveAtualizarPublicacaoComSucesso() {
        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));
        when(repository.save(publicacao)).thenReturn(publicacao);
        when(mapper.paraDto(publicacao)).thenReturn(publicacaoResponse);

        PublicacaoResponse response = publicacaoService.atualizar(usuarioId, publicacaoId, publicacaoRequest);

        assertThat(response).isNotNull();
        verify(repository).save(publicacao);
    }

    @Test
    @DisplayName("Atualizar: Deve lançar UsuarioNaoAutorizadoException se outro usuário tentar alterar")
    void deveLancarExcecaoAoAtualizarPostDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID(); // Alguém tentado invadir o post

        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));

        assertThatThrownBy(() -> publicacaoService.atualizar(outroUsuarioId, publicacaoId, publicacaoRequest))
            .isInstanceOf(UsuarioNaoAutorizadoException.class)
            .hasMessageContaining("permissão para modificar esta publicação");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // ALTERAR STATUS
    // =========================================================================

    @Test
    @DisplayName("AlterarStatus: Deve alterar de ATIVO para RESOLVIDO")
    void deveAlterarStatusComSucesso() {
        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));
        when(repository.save(publicacao)).thenReturn(publicacao);
        when(mapper.paraDto(publicacao)).thenReturn(publicacaoResponse);

        publicacaoService.alterarStatus(usuarioId, publicacaoId, StatusPublicacao.RESOLVIDO);

        assertThat(publicacao.getStatus()).isEqualTo(StatusPublicacao.RESOLVIDO);
        verify(repository).save(publicacao);
    }

    // =========================================================================
    // EXCLUIR
    // =========================================================================

    @Test
    @DisplayName("Excluir: Deve excluir o post se pertencer ao usuário logado")
    void deveExcluirPublicacaoComSucesso() {
        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));

        publicacaoService.excluir(usuarioId, publicacaoId);

        verify(repository).delete(publicacao);
    }

    @Test
    @DisplayName("Excluir: Deve lançar exceção ao tentar excluir post de outro usuário")
    void deveLancarExcecaoAoExcluirPostDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID();

        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));

        assertThatThrownBy(() -> publicacaoService.excluir(outroUsuarioId, publicacaoId))
            .isInstanceOf(UsuarioNaoAutorizadoException.class);

        verify(repository, never()).delete(any());
    }
}