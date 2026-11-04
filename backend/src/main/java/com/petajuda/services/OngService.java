package com.petajuda.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.exceptions.RecursoNaoEncontradoException;
import com.petajuda.exceptions.UsuarioNaoAutorizadoException;
import com.petajuda.exceptions.RegraDeNegocioException;
import com.petajuda.mappers.OngMapper;
import com.petajuda.model.Ong;
import com.petajuda.model.Usuario;
import com.petajuda.repositories.OngRepository;
import com.petajuda.repositories.UsuarioRepository;

@Service 
public class OngService {
    
    private final OngRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final OngMapper mapper;

    public OngService(OngRepository repository, UsuarioRepository usuarioRepository, OngMapper mapper) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.mapper = mapper;
    }

    @Transactional
    public OngResponse salvar(UUID usuarioId, OngRequest ongRequest) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar um usuário com o id: " + usuarioId)
        );

        if (usuario.getOng() != null) {
            throw new RegraDeNegocioException("Este usuário já possui uma ONG cadastrada.");
        }

        Ong entidade = mapper.paraEntidade(ongRequest);
        entidade.setUsuario(usuario);
        
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional(readOnly = true)
    public OngResponse buscarPorId(UUID ongId) {
        Ong ong = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ONG com o id: " + ongId)
        );
        return mapper.paraDto(ong);
    }

    @Transactional(readOnly = true)
    public List<OngResponse> buscarOngs() {
        return repository.findAll().stream().map(mapper::paraDto).toList();
    }

    @Transactional
    public OngResponse atualizar(UUID usuarioLogadoId, UUID ongId, OngRequest ongRequest) {
        Ong entidade = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ONG com o id: " + ongId)
        );

        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para editar os dados desta ONG.");
        }

        atualizarDadosEntidade(entidade, ongRequest);
        return mapper.paraDto(repository.save(entidade));
    }

    @Transactional
    public void excluir(UUID usuarioLogadoId, UUID ongId) {
        Ong entidade = repository.findById(ongId).orElseThrow(
            () -> new RecursoNaoEncontradoException("Não foi possível encontrar uma ONG com o id: " + ongId)
        );

        if (!entidade.getUsuario().getId().equals(usuarioLogadoId)) {
            throw new UsuarioNaoAutorizadoException("Você não tem permissão para excluir esta ONG.");
        }

        repository.delete(entidade);
    }

    private void atualizarDadosEntidade(Ong entidade, OngRequest dto) {
        if (dto.nome() != null) entidade.setNome(dto.nome());
        if (dto.razaoSocial() != null) entidade.setRazaoSocial(dto.razaoSocial());
        if (dto.cnpj() != null) entidade.setCnpj(dto.cnpj());
        if (dto.chavePix() != null) entidade.setChavePix(dto.chavePix());
        if (dto.descricao() != null) entidade.setDescricao(dto.descricao());
        if (dto.endereco() != null) entidade.setEndereco(dto.endereco());
    }

}