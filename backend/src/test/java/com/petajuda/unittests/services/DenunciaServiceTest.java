package com.petajuda.unittests.services;

import java.time.LocalDateTime;
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

import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.response.DenunciaResponse;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.mappers.DenunciaMapper;
import com.petajuda.mappers.EnderecoMapper;
import com.petajuda.model.Denuncia;
import com.petajuda.model.Endereco;
import com.petajuda.repositories.DenunciaRepository;
import com.petajuda.services.DenunciaService;

@ExtendWith(MockitoExtension.class)
class DenunciaServiceTest {

    @Mock
    private DenunciaRepository repository;

    @Mock
    private DenunciaMapper mapper;

    @Mock
    private EnderecoMapper enderecoMapper;

    @InjectMocks
    private DenunciaService denunciaService;

    private Denuncia denuncia;
    private DenunciaRequest denunciaRequest;
    private DenunciaResponse denunciaResponse;
    private UUID denunciaId;

    @BeforeEach
    void setUp() {
        denunciaId = UUID.randomUUID();

        Endereco endereco = new Endereco("SC", "Laguna", "Centro", "Rua X", "123");
        EnderecoDto enderecoDto = new EnderecoDto("SC", "Laguna", "Centro", "Rua X", "123");

        denuncia = new Denuncia();
        denuncia.setId(denunciaId);
        denuncia.setTitulo("Maus-tratos a cachorro");
        denuncia.setDescricao("Cachorro acorrentado");
        denuncia.setFotoUrl("foto.jpg");
        denuncia.setData(LocalDateTime.now());
        denuncia.setStatus(StatusDenuncia.PENDENTE);
        denuncia.setEndereco(endereco);

        denunciaRequest = new DenunciaRequest(
            "Maus-tratos a cachorro", "Cachorro acorrentado", "foto.jpg", enderecoDto
        );

        denunciaResponse = new DenunciaResponse(
            denunciaId, "Maus-tratos a cachorro", "Cachorro acorrentado", 
            "foto.jpg", denuncia.getData(), StatusDenuncia.PENDENTE, enderecoDto
        );
    }

    // =========================================================================
    // SALVAR (REGISTRAR DENÚNCIA ANÔNIMA)
    // =========================================================================

    @Test
    @DisplayName("Salvar: Deve registrar uma nova denúncia com status PENDENTE por padrão")
    void deveSalvarDenunciaComSucesso() {
        when(mapper.paraEntidade(denunciaRequest)).thenReturn(denuncia);
        when(repository.save(denuncia)).thenReturn(denuncia);
        when(mapper.paraDto(denuncia)).thenReturn(denunciaResponse);

        DenunciaResponse response = denunciaService.salvar(denunciaRequest);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(StatusDenuncia.PENDENTE);
        assertThat(denuncia.getStatus()).isEqualTo(StatusDenuncia.PENDENTE);
        
        verify(repository).save(denuncia);
    }

    // =========================================================================
    // BUSCAR
    // =========================================================================

    @Test
    @DisplayName("BuscarPorId: Deve retornar a denúncia pelo ID")
    void deveBuscarPorIdComSucesso() {
        when(repository.findById(denunciaId)).thenReturn(Optional.of(denuncia));
        when(mapper.paraDto(denuncia)).thenReturn(denunciaResponse);

        DenunciaResponse response = denunciaService.buscarPorId(denunciaId);

        assertThat(response).isNotNull();
        verify(repository).findById(denunciaId);
    }

    @Test
    @DisplayName("BuscarPorId: Deve lançar RecursoNaoEncontradoException se o ID não existir")
    void deveLancarExcecaoAoBuscarPorIdInexistente() {
        when(repository.findById(denunciaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> denunciaService.buscarPorId(denunciaId))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("Denúncia não encontrada");
    }

    @Test
    @DisplayName("BuscarTodas: Deve retornar lista de denúncias")
    void deveBuscarTodasAsDenuncias() {
        when(repository.findAll()).thenReturn(List.of(denuncia));
        when(mapper.paraDto(denuncia)).thenReturn(denunciaResponse);

        List<DenunciaResponse> lista = denunciaService.buscarTodas();

        assertThat(lista).isNotEmpty().hasSize(1);
        verify(repository).findAll();
    }

    // =========================================================================
    // ALTERAR STATUS
    // =========================================================================

    @Test
    @DisplayName("AlterarStatus: Deve alterar o status da denúncia com sucesso")
    void deveAlterarStatusDaDenuncia() {
        when(repository.findById(denunciaId)).thenReturn(Optional.of(denuncia));
        when(repository.save(denuncia)).thenReturn(denuncia);
        when(mapper.paraDto(denuncia)).thenReturn(denunciaResponse);

        denunciaService.alterarStatus(denunciaId, StatusDenuncia.EM_ANALISE);

        assertThat(denuncia.getStatus()).isEqualTo(StatusDenuncia.EM_ANALISE);
        verify(repository).save(denuncia);
    }

    @Test
    @DisplayName("AlterarStatus: Deve lançar exceção ao alterar status de denúncia inexistente")
    void deveLancarExcecaoAoAlterarStatusInexistente() {
        when(repository.findById(denunciaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> denunciaService.alterarStatus(denunciaId, StatusDenuncia.EM_ANALISE))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("Denúncia não encontrada");

        verify(repository, never()).save(any());
    }

    // =========================================================================
    // EXCLUIR
    // =========================================================================

    @Test
    @DisplayName("Excluir: Deve excluir a denúncia com sucesso")
    void deveExcluirDenunciaComSucesso() {
        when(repository.findById(denunciaId)).thenReturn(Optional.of(denuncia));

        denunciaService.excluir(denunciaId);

        verify(repository).delete(denuncia);
    }

    @Test
    @DisplayName("Excluir: Deve lançar exceção ao tentar excluir denúncia inexistente")
    void deveLancarExcecaoAoExcluirDenunciaInexistente() {
        when(repository.findById(denunciaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> denunciaService.excluir(denunciaId))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("Denúncia não encontrada");

        verify(repository, never()).delete(any());
    }
}