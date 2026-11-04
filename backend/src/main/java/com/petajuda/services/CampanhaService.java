package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petajuda.dtos.request.CampanhaRequest;
import com.petajuda.dtos.response.CampanhaResponse;
import com.petajuda.exceptions.RegraDeNegocioException;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.mappers.CampanhaMapper;
import com.petajuda.model.Campanha;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.CampanhaRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service
public class CampanhaService {

    // Dependencias da classe
    private final CampanhaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final CampanhaMapper mapper;

    // Injecao das dependencias via construtor
    public CampanhaService(CampanhaRepository repository, 
                           UsuarioRepository usuarioRepository, 
                           CampanhaMapper mapper) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.mapper = mapper;
    }

    // Salva uma Campanha
    @Transactional
    public CampanhaResponse salvar(UUID usuarioLogadoId, CampanhaRequest request) {

        // Verifica se a Campanha existe
        Usuario usuario = usuarioRepository.findById(usuarioLogadoId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Usuário não encontrado.")
        );

        // Verifica se o Usuario possui uma Ong cadastrada
        if (usuario.getOng() == null) {
            throw new UsuarioNaoAutorizadoException("Você precisa ter uma ONG cadastrada para criar campanhas.");
        }

        // Verifica se a data de fim da Camapanha antecede a data de inicio
        if (request.fim().isBefore(request.inicio())) {
            throw new RegraDeNegocioException("A data de término da campanha não pode ser anterior à data de início.");
        }

        Campanha entidade = mapper.paraEntidade(request);
        entidade.setOng(usuario.getOng());
        entidade.setAtivo(true);
        
        return mapper.paraDto(repository.save(entidade));
    }

    // Busca uma Camppanha pelo id
    @Transactional(readOnly = true)
    public CampanhaResponse buscarPorId(UUID id) {

        // Verifica se a Campanha existe
        Campanha campanha = repository.findById(id).orElseThrow(
            () -> new RecursoNaoEncontradoException("Campanha não encontrada.")
        );
        return mapper.paraDto(campanha);
    }

    // Busca todas as Campanhas cadastradas
    @Transactional(readOnly = true)
    public List<CampanhaResponse> buscarTodas() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }

    // Busca uma Camapanha usando o id da Ong
    @Transactional(readOnly = true)
    public List<CampanhaResponse> buscarPorOng(UUID ongId) {
        return repository.findByOngId(ongId).stream().map(mapper::paraDto).toList();
    }

    // Atualiza uma Campanha
    @Transactional
    public CampanhaResponse atualizar(UUID usuarioLogadoId, UUID campanhaId, CampanhaRequest request) {

        // Verifica se a Campanha existe
        Campanha entidade = repository.findById(campanhaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Campanha não encontrada.")
        );

        validarPosseDaOng(entidade, usuarioLogadoId);
        atualizarDados(entidade, request);

        return mapper.paraDto(repository.save(entidade));
    }

    // Altera o status da Campanha
    @Transactional
    public CampanhaResponse alterarStatus(UUID usuarioLogadoId, UUID campanhaId, Boolean ativo) {

        // Verifica se a Camapanha existe
        Campanha entidade = repository.findById(campanhaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Campanha não encontrada.")
        );

        validarPosseDaOng(entidade, usuarioLogadoId);
        
        entidade.setAtivo(ativo);
        return mapper.paraDto(repository.save(entidade));
    }

    // Excluir uma Campanha
    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID campanhaId) {

        // Verifica se a Campanha existe
        Campanha entidade = repository.findById(campanhaId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Campanha não encontrada.")
        );

        validarPosseDaOng(entidade, usuarioLogadoId);
        repository.delete(entidade);
    }

    // Metodo auxiliar para verificar se o Usuario possui permissao para editar a Campanha de uma Ong
    private void validarPosseDaOng(Campanha campanha, UUID usuarioLogadoId) {

        // Verifica se o Usuario possui permissao para alterar a Campanha
        if (!campanha.getOng().getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para modificar as campanhas desta ONG.");
        }
    }

    // Metodo auxiliar para alterar os dados da Campanha
    private void atualizarDados(Campanha entidade, CampanhaRequest request) {
        if (request.titulo() != null) entidade.setTitulo(request.titulo());
        if (request.descricao() != null) entidade.setDescricao(request.descricao());
        if (request.inicio() != null) entidade.setInicio(request.inicio());
        if (request.fim() != null) {
            if (entidade.getInicio().isAfter(request.fim())) {
                throw new RegraDeNegocioException("A data de término não pode ser anterior à de início.");
            }
            entidade.setFim(request.fim());
        }
    }
}