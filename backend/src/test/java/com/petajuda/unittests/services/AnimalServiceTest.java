package com.petajuda.unittests.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.response.AnimalResponse;
import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.AnimalMapper;
import com.petajuda.model.Animal;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.AnimalRepository;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.services.AnimalService;
import com.petajuda.services.CloudinaryService;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock
    private AnimalRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AnimalMapper mapper;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AnimalService animalService;

    private Usuario usuarioLogado;
    private Animal animal;
    private AnimalRequest animalRequest;
    private AnimalResponse animalResponse;
    private MockMultipartFile fotoPadrao;
    private UUID usuarioId;
    private UUID animalId;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        animalId = UUID.randomUUID();

        fotoPadrao = new MockMultipartFile(
                "foto",
                "rex.jpg",
                "image/jpeg",
                "imagem_simulada".getBytes()
        );

        usuarioLogado = new Usuario();
        usuarioLogado.setId(usuarioId);

        animal = new Animal();
        animal.setId(animalId);
        animal.setNome("Rex");
        animal.setFotoUrl("https://res.cloudinary.com/demo/image/upload/v1/petajuda/animais/rex.jpg");
        animal.setUsuario(usuarioLogado);

        animalRequest = new AnimalRequest(
                "Rex Atualizado", "Macho", "Preto", true, true,
                "Muito dócil", IdadeAnimal.ADULTO, PorteAnimal.MEDIO, EspecieAnimal.CACHORRO
        );

        animalResponse = new AnimalResponse(
                animalId, "Rex Atualizado", "Macho", "Preto", true, true,
                "Muito dócil", "url_foto", IdadeAnimal.ADULTO, PorteAnimal.MEDIO,
                EspecieAnimal.CACHORRO, usuarioId
        );
    }

    // =========================================================================
    // SALVAR
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve salvar e retornar o AnimalResponse quando o usuário existir")
    void deveSalvarAnimalComSucesso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(cloudinaryService.enviarFoto(fotoPadrao, "animais")).thenReturn("url_foto");
        when(mapper.paraEntidade(animalRequest)).thenReturn(animal);
        when(repository.save(animal)).thenReturn(animal);
        when(mapper.paraDto(animal)).thenReturn(animalResponse);

        AnimalResponse response = animalService.salvar(usuarioId, animalRequest, fotoPadrao);

        assertThat(response).isNotNull();
        assertThat(response.nome()).isEqualTo("Rex Atualizado");
        verify(cloudinaryService).enviarFoto(fotoPadrao, "animais");
        verify(usuarioRepository).findById(usuarioId);
        verify(repository).save(animal);
    }

    @Test
    @DisplayName("Salvar: Deve lançar exceção se o usuário não for encontrado")
    void deveLancarExcecaoAoSalvarSeUsuarioNaoExistir() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> animalService.salvar(usuarioId, animalRequest, fotoPadrao))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Usuário inexistente");

        verify(cloudinaryService, never()).enviarFoto(any(), any());
        verify(repository, never()).save(any());
    }

    // =========================================================================
    // BUSCAR POR ID
    // =========================================================================

    @Test
    @DisplayName("BuscarPorId: Deve retornar AnimalResponse quando encontrar o animal")
    void deveBuscarPorIdComSucesso() {
        when(repository.findById(animalId)).thenReturn(Optional.of(animal));
        when(mapper.paraDto(animal)).thenReturn(animalResponse);

        AnimalResponse response = animalService.buscarPorId(animalId);

        assertThat(response).isNotNull();
        verify(repository).findById(animalId);
    }

    @Test
    @DisplayName("BuscarPorId: Deve lançar exceção quando o animal não existir")
    void deveLancarExcecaoAoBuscarPorIdInexistente() {
        when(repository.findById(animalId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> animalService.buscarPorId(animalId))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    // =========================================================================
    // BUSCAR ANIMAIS POR USUARIO ID
    // =========================================================================

    @Test
    @DisplayName("BuscarAnimaisPorUsuarioId: Deve retornar lista de animais do usuário")
    void deveRetornarListaDeAnimaisDoUsuario() {
        when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
        when(repository.findByUsuarioId(usuarioId)).thenReturn(List.of(animal));
        when(mapper.paraDto(animal)).thenReturn(animalResponse);

        List<AnimalResponse> lista = animalService.buscarAnimaisPorUsuarioId(usuarioId);

        assertThat(lista).isNotEmpty().hasSize(1);
        verify(repository).findByUsuarioId(usuarioId);
    }

    @Test
    @DisplayName("BuscarAnimaisPorUsuarioId: Deve lançar exceção se usuário não existir")
    void deveLancarExcecaoAoBuscarAnimaisSeUsuarioInexistente() {
        when(usuarioRepository.existsById(usuarioId)).thenReturn(false);

        assertThatThrownBy(() -> animalService.buscarAnimaisPorUsuarioId(usuarioId))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Usuário não encontrado");
    }

    // =========================================================================
    // ATUALIZAR
    // =========================================================================

    @Test
    @DisplayName("Atualizar: Deve atualizar os dados se o animal pertencer ao usuário logado")
    void deveAtualizarAnimalComSucesso() {
        when(repository.findById(animalId)).thenReturn(Optional.of(animal));
        when(repository.save(animal)).thenReturn(animal);
        when(mapper.paraDto(animal)).thenReturn(animalResponse);

        AnimalResponse response = animalService.atualizar(usuarioId, animalId, animalRequest, null);

        assertThat(response).isNotNull();
        assertThat(animal.getNome()).isEqualTo("Rex Atualizado"); // Verifica se o método auxiliar alterou a entidade
        verify(cloudinaryService, never()).enviarFoto(any(), any());
        verify(repository).save(animal);
    }

    @Test
    @DisplayName("Atualizar: Deve enviar nova foto e excluir a antiga do Cloudinary quando novaFoto for informada")
    void deveAtualizarAnimalComNovaFotoEExcluirAntiga() {
        String urlAntiga = animal.getFotoUrl();
        String novaUrl = "https://res.cloudinary.com/demo/image/upload/v2/petajuda/animais/rex_novo.jpg";

        when(repository.findById(animalId)).thenReturn(Optional.of(animal));
        when(cloudinaryService.enviarFoto(fotoPadrao, "animais")).thenReturn(novaUrl);
        when(repository.save(animal)).thenReturn(animal);
        when(mapper.paraDto(animal)).thenReturn(animalResponse);

        animalService.atualizar(usuarioId, animalId, animalRequest, fotoPadrao);

        assertThat(animal.getFotoUrl()).isEqualTo(novaUrl);
        verify(cloudinaryService).enviarFoto(fotoPadrao, "animais");
        verify(cloudinaryService).excluirFoto(urlAntiga);
        verify(repository).save(animal);
    }

    @Test
    @DisplayName("Atualizar: Deve lançar UsuarioNaoAutorizadoException se o animal pertencer a outro usuário")
    void deveLancarExcecaoAoAtualizarAnimalDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID();
        Usuario outroUsuario = new Usuario();
        outroUsuario.setId(outroUsuarioId);
        animal.setUsuario(outroUsuario);

        when(repository.findById(animalId)).thenReturn(Optional.of(animal));

        assertThatThrownBy(() -> animalService.atualizar(usuarioId, animalId, animalRequest, fotoPadrao))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Você não tem permissão para editar o cadastro deste animal.");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // EXCLUIR
    // =========================================================================

    @Test
    @DisplayName("Excluir: Deve remover o animal se pertencer ao usuário logado")
    void deveExcluirAnimalComSucesso() {
        String fotoUrl = animal.getFotoUrl();
        when(repository.findById(animalId)).thenReturn(Optional.of(animal));

        animalService.excluir(usuarioId, animalId);

        verify(repository).delete(animal);
        verify(cloudinaryService).excluirFoto(fotoUrl);
    }

    @Test
    @DisplayName("Excluir: Deve lançar UsuarioNaoAutorizadoException se tentar excluir animal de outro usuário")
    void deveLancarExcecaoAoExcluirAnimalDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID();
        Usuario outroUsuario = new Usuario();
        outroUsuario.setId(outroUsuarioId);
        animal.setUsuario(outroUsuario);

        when(repository.findById(animalId)).thenReturn(Optional.of(animal));

        assertThatThrownBy(() -> animalService.excluir(usuarioId, animalId))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Você não tem permissão para excluir este animal.");

        verify(repository, never()).delete(any());
    }
}