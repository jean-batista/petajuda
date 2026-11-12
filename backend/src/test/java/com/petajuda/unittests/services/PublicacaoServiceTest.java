package com.petajuda.unittests.services;

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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.response.PublicacaoResponse;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.enums.TipoPublicacao;
import com.petajuda.exceptions.RegraDeNegocioException;
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
import com.petajuda.services.CloudinaryService;
import com.petajuda.services.PublicacaoService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private PublicacaoService publicacaoService;

    private Usuario usuarioLogado;
    private Animal animal;
    private Publicacao publicacao;
    private PublicacaoRequest publicacaoRequest;
    private PublicacaoResponse publicacaoResponse;
    private MockMultipartFile fotoPadrao;
    private UUID usuarioId;
    private UUID animalId;
    private UUID publicacaoId;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        animalId = UUID.randomUUID();
        publicacaoId = UUID.randomUUID();

        // Instância padrão de arquivo simulado para testes que exigem upload
        fotoPadrao = new MockMultipartFile(
                "foto",                  // Nome do campo (@RequestPart)
                "cachorro.jpg",          // Nome original do arquivo
                "image/jpeg",            // Content-Type válido
                "conteudo_fake".getBytes() // Bytes simulados (garante isEmpty() == false)
        );

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
                publicacaoId, "Cachorro Perdido", "Fugiu no bairro Oficinas", "publicacao_url",
                publicacao.getData(), StatusPublicacao.ATIVO, TipoPublicacao.PERDIDO, enderecoDto,
                usuarioId, "Maria", "48999999999",
                animalId, "Thor", "url_foto_thor"
        );
    }

    // =========================================================================
    // CRIAR (SALVAR)
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve criar publicação se animal existir e pertencer ao usuário logado (Herdando foto)")
    void deveSalvarPublicacaoComSucesso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(mapper.paraEntidade(publicacaoRequest)).thenReturn(publicacao);
        when(repository.save(publicacao)).thenReturn(publicacao);
        when(mapper.paraDto(publicacao)).thenReturn(publicacaoResponse);

        // Passando null na foto para simular a herança da foto do Animal vinculado
        PublicacaoResponse response = publicacaoService.salvar(usuarioId, publicacaoRequest, fotoPadrao);

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

        assertThatThrownBy(() -> publicacaoService.salvar(usuarioId, publicacaoRequest, fotoPadrao))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("só pode criar publicações para animais cadastrados no seu perfil");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Salvar: Deve lançar RegraDeNegocioException se post de PERDIDO ou ADOCAO não tiver animal vinculado")
    void deveLancarExcecaoAoCriarPostPerdidoSemAnimal() {
        PublicacaoRequest requestSemAnimal = new PublicacaoRequest(
                "Cachorro Perdido", "Fugiu", TipoPublicacao.PERDIDO, null, publicacaoRequest.endereco()
        );

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));

        assertThatThrownBy(() -> publicacaoService.salvar(usuarioId, requestSemAnimal, null))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("obrigatório vincular um animal cadastrado");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Salvar: Deve lançar RegraDeNegocioException se post de ENCONTRADO não tiver animal e não enviar foto")
    void deveLancarExcecaoAoCriarPostEncontradoSemAnimalESemFoto() {
        PublicacaoRequest requestEncontrado = new PublicacaoRequest(
                "Cachorro Encontrado", "Achei na rua", TipoPublicacao.ENCONTRADO, null, publicacaoRequest.endereco()
        );

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));

        assertThatThrownBy(() -> publicacaoService.salvar(usuarioId, requestEncontrado, null))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("obrigatório anexar uma foto");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Salvar: Deve salvar post de ENCONTRADO com sucesso enviando foto própria e sem vínculo de animal")
    void deveSalvarPostEncontradoComFotoPropria() {
        PublicacaoRequest requestEncontrado = new PublicacaoRequest(
                "Cachorro Encontrado", "Achei na rua", TipoPublicacao.ENCONTRADO, null, publicacaoRequest.endereco()
        );

        MultipartFile fotoMock = mock(MultipartFile.class);
        when(fotoMock.isEmpty()).thenReturn(false);

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(cloudinaryService.enviarFoto(fotoMock, "publicacoes")).thenReturn("url_da_foto_encontrado");

        Publicacao entidadeMock = new Publicacao();
        when(mapper.paraEntidade(requestEncontrado)).thenReturn(entidadeMock);
        when(repository.save(entidadeMock)).thenReturn(entidadeMock);
        when(mapper.paraDto(entidadeMock)).thenReturn(publicacaoResponse);

        PublicacaoResponse response = publicacaoService.salvar(usuarioId, requestEncontrado, fotoMock);

        assertThat(response).isNotNull();
        assertThat(entidadeMock.getFotoUrl()).isEqualTo("url_da_foto_encontrado");
        verify(cloudinaryService).enviarFoto(fotoMock, "publicacoes");
        verify(repository).save(entidadeMock);
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

        PublicacaoResponse response = publicacaoService.atualizar(usuarioId, publicacaoId, publicacaoRequest, null);

        assertThat(response).isNotNull();
        verify(repository).save(publicacao);
    }

    @Test
    @DisplayName("Atualizar: Deve lançar UsuarioNaoAutorizadoException se outro usuário tentar alterar")
    void deveLancarExcecaoAoAtualizarPostDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID(); // Alguém tentado invadir o post

        when(repository.findById(publicacaoId)).thenReturn(Optional.of(publicacao));

        assertThatThrownBy(() -> publicacaoService.atualizar(outroUsuarioId, publicacaoId, publicacaoRequest, null))
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