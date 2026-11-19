package com.petajuda.unittests.services;

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.exceptions.RegraDeNegocioException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.mappers.OngMapper;
import com.petajuda.model.Endereco;
import com.petajuda.model.Ong;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.OngRepository;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.services.OngService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OngServiceTest {

    @Mock
    private OngRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private OngMapper mapper;

    @Mock
    private EnderecoMapper enderecoMapper;

    @InjectMocks
    private OngService ongService;

    private Usuario usuarioLogado;
    private Ong ong;
    private OngRequest ongRequest;
    private OngResponse ongResponse;
    private UUID usuarioId;
    private UUID ongId;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        ongId = UUID.randomUUID();

        Endereco endereco = new Endereco("SC", "Tubarão", "Centro", "Rua Y", "100");
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Tubarão", "Centro", "Rua Y", "100");

        usuarioLogado = new Usuario();
        usuarioLogado.setId(usuarioId);

        ong = new Ong();
        ong.setId(ongId);
        ong.setNome("Patinhas Felizes");
        ong.setRazaoSocial("Associação Patinhas");
        ong.setCnpj("12.345.678/0001-99");
        ong.setUsuario(usuarioLogado); // Relacionamento 1:1
        ong.setEndereco(endereco);

        ongRequest = new OngRequest(
                "Patinhas Felizes", "Associação Patinhas", "12.345.678/0001-99",
                "pix@patinhas.org", "Resgate de animais", enderecoDto
        );

        ongResponse = new OngResponse(
                ongId, "Patinhas Felizes", "Associação Patinhas", "12.345.678/0001-99",
                "pix@patinhas.org", "Resgate de animais", null, enderecoDto, usuarioId
        );
    }

    // =========================================================================
    // SALVAR
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve salvar a ONG com sucesso se o usuário não tiver outra vinculada")
    void deveSalvarOngComSucesso() {
        usuarioLogado.setOng(null); // Garante que o usuário não possui ONG

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(mapper.paraEntidade(ongRequest)).thenReturn(ong);
        when(repository.save(ong)).thenReturn(ong);
        when(mapper.paraDto(ong)).thenReturn(ongResponse);

        OngResponse response = ongService.salvar(usuarioId, ongRequest);

        assertThat(response).isNotNull();
        assertThat(response.nome()).isEqualTo("Patinhas Felizes");
        verify(repository).save(ong);
    }

    @Test
    @DisplayName("Salvar: Deve lançar RegraDeNegocioException se o usuário já possuir uma ONG cadastrada")
    void deveLancarExcecaoAoSalvarSeUsuarioJaPossuirOng() {
        usuarioLogado.setOng(new Ong()); // Simula que o usuário já possui uma ONG vinculada

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));

        assertThatThrownBy(() -> ongService.salvar(usuarioId, ongRequest))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("já possui uma ONG cadastrada");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // BUSCAR
    // =========================================================================

    @Test
    @DisplayName("BuscarPorId: Deve retornar a ONG pelo ID com sucesso")
    void deveBuscarPorIdComSucesso() {
        when(repository.findById(ongId)).thenReturn(Optional.of(ong));
        when(mapper.paraDto(ong)).thenReturn(ongResponse);

        OngResponse response = ongService.buscarPorId(ongId);

        assertThat(response).isNotNull();
        verify(repository).findById(ongId);
    }

    @Test
    @DisplayName("BuscarOngs: Deve retornar uma lista de ONGs com sucesso")
    void deveBuscarTodasAsOngs() {
        when(repository.findAll()).thenReturn(List.of(ong));
        when(mapper.paraDto(ong)).thenReturn(ongResponse);

        List<OngResponse> ongs = ongService.buscarOngs();

        assertThat(ongs).isNotEmpty().hasSize(1);
        verify(repository).findAll();
    }

    // =========================================================================
    // ATUALIZAR
    // =========================================================================

    @Test
    @DisplayName("Atualizar: Deve atualizar os dados se o usuário logado for o dono da ONG")
    void deveAtualizarOngComSucesso() {
        when(repository.findById(ongId)).thenReturn(Optional.of(ong));
        when(enderecoMapper.paraEntidade(any())).thenReturn(new Endereco("SC", "Tubarão", "Centro", "Rua Y", "100"));
        when(repository.save(ong)).thenReturn(ong);
        when(mapper.paraDto(ong)).thenReturn(ongResponse);

        OngResponse response = ongService.atualizar(usuarioId, ongId, ongRequest);

        assertThat(response).isNotNull();
        verify(repository).save(ong);
    }

    @Test
    @DisplayName("Atualizar: Deve lançar UsuarioNaoAutorizadoException se o usuário tentar alterar a ONG de outro")
    void deveLancarExcecaoAoAtualizarOngDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID();
        // O usuário da entidade ONG e o que está tentando alterar são diferentes

        when(repository.findById(ongId)).thenReturn(Optional.of(ong));

        assertThatThrownBy(() -> ongService.atualizar(outroUsuarioId, ongId, ongRequest))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("permissão para editar os dados desta ONG");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // EXCLUIR
    // =========================================================================

    @Test
    @DisplayName("Excluir: Deve excluir a ONG com sucesso se for o dono")
    void deveExcluirOngComSucesso() {
        when(repository.findById(ongId)).thenReturn(Optional.of(ong));

        ongService.excluir(usuarioId, ongId);

        verify(repository).delete(ong);
    }

    @Test
    @DisplayName("Excluir: Deve lançar exceção se tentar excluir a ONG de outro usuário")
    void deveLancarExcecaoAoExcluirOngDeOutroUsuario() {
        UUID outroUsuarioId = UUID.randomUUID();

        when(repository.findById(ongId)).thenReturn(Optional.of(ong));

        assertThatThrownBy(() -> ongService.excluir(outroUsuarioId, ongId))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("permissão para excluir esta ONG");

        verify(repository, never()).delete(any());
    }
}