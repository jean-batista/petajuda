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

import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.exceptions.RegraDeNegocioException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.CampanhaMapper;
import com.petajuda.model.Campanha;
import com.petajuda.model.Ong;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.CampanhaRepository;
import com.petajuda.repositories.UsuarioRepository;
import com.petajuda.services.CampanhaService;

@ExtendWith(MockitoExtension.class)
class CampanhaServiceTest {

    @Mock
    private CampanhaRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CampanhaMapper mapper;

    @InjectMocks
    private CampanhaService campanhaService;

    private Usuario usuarioLogado;
    private Ong ong;
    private Campanha campanha;
    private CampanhaRequest campanhaRequest;
    private CampanhaResponse campanhaResponse;
    private UUID usuarioId;
    private UUID ongId;
    private UUID campanhaId;
    private LocalDateTime inicio;
    private LocalDateTime fim;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        ongId = UUID.randomUUID();
        campanhaId = UUID.randomUUID();
        inicio = LocalDateTime.now().plusDays(1);
        fim = LocalDateTime.now().plusDays(10);

        usuarioLogado = new Usuario();
        usuarioLogado.setId(usuarioId);

        ong = new Ong();
        ong.setId(ongId);
        ong.setNome("ONG Patinhas");
        ong.setUsuario(usuarioLogado); // Relacionamento 1:1
        usuarioLogado.setOng(ong);

        campanha = new Campanha();
        campanha.setId(campanhaId);
        campanha.setTitulo("Arrecadação de Ração");
        campanha.setInicio(inicio);
        campanha.setFim(fim);
        campanha.setOng(ong);
        campanha.setAtivo(true);

        campanhaRequest = new CampanhaRequest(
                "Arrecadação de Ração", "Precisamos de ração", inicio, fim
        );

        campanhaResponse = new CampanhaResponse(
                campanhaId, "Arrecadação de Ração", "Precisamos de ração", 
                inicio, fim, true, ongId, "ONG Patinhas"
        );
    }

    // =========================================================================
    // SALVAR
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve salvar campanha com sucesso se usuário for dono de ONG e datas válidas")
    void deveSalvarCampanhaComSucesso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));
        when(mapper.paraEntidade(campanhaRequest)).thenReturn(campanha);
        when(repository.save(campanha)).thenReturn(campanha);
        when(mapper.paraDto(campanha)).thenReturn(campanhaResponse);

        CampanhaResponse response = campanhaService.salvar(usuarioId, campanhaRequest);

        assertThat(response).isNotNull();
        assertThat(response.titulo()).isEqualTo("Arrecadação de Ração");
        verify(repository).save(campanha);
    }

    @Test
    @DisplayName("Salvar: Deve lançar UsuarioNaoAutorizadoException se o usuário não possuir ONG cadastrada")
    void deveLancarExcecaoAoSalvarSeUsuarioNaoTiverOng() {
        usuarioLogado.setOng(null); // Usuário sem ONG
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));

        assertThatThrownBy(() -> campanhaService.salvar(usuarioId, campanhaRequest))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("Você precisa ter uma ONG cadastrada");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Salvar: Deve lançar RegraDeNegocioException se a data de fim for antes da data de início")
    void deveLancarExcecaoAoSalvarSeDataInvalida() {
        CampanhaRequest requestInvalido = new CampanhaRequest(
                "Arrecadação", "Desc", inicio, inicio.minusDays(1) // Fim no passado em relação ao inicio
        );

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioLogado));

        assertThatThrownBy(() -> campanhaService.salvar(usuarioId, requestInvalido))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("anterior à data de início");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // BUSCAS (GET)
    // =========================================================================

    @Test
    @DisplayName("BuscarPorId: Deve retornar a campanha com sucesso")
    void deveBuscarPorIdComSucesso() {
        when(repository.findById(campanhaId)).thenReturn(Optional.of(campanha));
        when(mapper.paraDto(campanha)).thenReturn(campanhaResponse);

        CampanhaResponse response = campanhaService.buscarPorId(campanhaId);

        assertThat(response).isNotNull();
        verify(repository).findById(campanhaId);
    }

    @Test
    @DisplayName("BuscarTodas / BuscarPorOng: Devem retornar listas de campanhas")
    void deveBuscarListasComSucesso() {
        when(repository.findAll()).thenReturn(List.of(campanha));
        when(repository.findByOngId(ongId)).thenReturn(List.of(campanha));
        when(mapper.paraDto(campanha)).thenReturn(campanhaResponse);

        List<CampanhaResponse> todas = campanhaService.buscarTodas();
        List<CampanhaResponse> porOng = campanhaService.buscarPorOng(ongId);

        assertThat(todas).hasSize(1);
        assertThat(porOng).hasSize(1);
    }

    // =========================================================================
    // ATUALIZAR
    // =========================================================================

    @Test
    @DisplayName("Atualizar: Deve atualizar campanha se o usuário for o dono da ONG")
    void deveAtualizarCampanhaComSucesso() {
        when(repository.findById(campanhaId)).thenReturn(Optional.of(campanha));
        when(repository.save(campanha)).thenReturn(campanha);
        when(mapper.paraDto(campanha)).thenReturn(campanhaResponse);

        CampanhaResponse response = campanhaService.atualizar(usuarioId, campanhaId, campanhaRequest);

        assertThat(response).isNotNull();
        verify(repository).save(campanha);
    }

    @Test
    @DisplayName("Atualizar: Deve lançar UsuarioNaoAutorizadoException se o usuário não for dono da ONG")
    void deveLancarExcecaoAoAtualizarSeNaoForDonoDaOng() {
        UUID outroUsuarioId = UUID.randomUUID();
        // O usuário logado tentando alterar não é o dono da ONG vinculada à campanha
        
        when(repository.findById(campanhaId)).thenReturn(Optional.of(campanha));

        assertThatThrownBy(() -> campanhaService.atualizar(outroUsuarioId, campanhaId, campanhaRequest))
                .isInstanceOf(UsuarioNaoAutorizadoException.class)
                .hasMessageContaining("permissão para modificar as campanhas desta ONG");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Atualizar: Deve lançar RegraDeNegocioException se tentar atualizar com data de término anterior à de início")
    void deveLancarExcecaoAoAtualizarComDataTerminoInvalida() {
        CampanhaRequest requestInvalido = new CampanhaRequest(
                "Arrecadação", "Desc", null, inicio.minusDays(5) // Fim antes do inicio atual da entidade
        );

        when(repository.findById(campanhaId)).thenReturn(Optional.of(campanha));

        assertThatThrownBy(() -> campanhaService.atualizar(usuarioId, campanhaId, requestInvalido))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("não pode ser anterior");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // ALTERAR STATUS
    // =========================================================================

    @Test
    @DisplayName("AlterarStatus: Deve alterar o status ativo da campanha com sucesso")
    void deveAlterarStatusComSucesso() {
        when(repository.findById(campanhaId)).thenReturn(Optional.of(campanha));
        when(repository.save(campanha)).thenReturn(campanha);
        when(mapper.paraDto(campanha)).thenReturn(campanhaResponse);

        campanhaService.alterarStatus(usuarioId, campanhaId, false);

        assertThat(campanha.getAtivo()).isFalse();
        verify(repository).save(campanha);
    }

    // =========================================================================
    // EXCLUIR
    // =========================================================================

    @Test
    @DisplayName("Excluir: Deve excluir a campanha com sucesso")
    void deveExcluirCampanhaComSucesso() {
        when(repository.findById(campanhaId)).thenReturn(Optional.of(campanha));

        campanhaService.excluir(usuarioId, campanhaId);

        verify(repository).delete(campanha);
    }
}